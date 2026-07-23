import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const hasUpstashConfig = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

if (!hasUpstashConfig && env.NODE_ENV === "production") {
  throw new Error(
    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN must be set in production — the signup " +
      "endpoint refuses to run without rate limiting once it's public. See README.md.",
  );
}

const limiter = hasUpstashConfig
  ? new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      // 5 signup attempts per IP per 10 minutes — generous for a real person,
      // tight enough to blunt a scripted flood against the Resend/Supabase quota.
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "mukago:signup",
    })
  : null;

export async function checkSignupRateLimit(identifier: string) {
  if (!limiter) {
    console.warn(
      "[ratelimit] Upstash is not configured — allowing request through unthrottled (development only).",
    );
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    return await limiter.limit(identifier);
  } catch (error) {
    // A Redis outage shouldn't take the whole signup form down with it —
    // the honeypot, origin check, and Supabase unique constraint still give
    // defense in depth. Fail open, but log loudly so an actual outage is
    // visible rather than silently discovered as "signups stopped".
    console.error("[ratelimit] Upstash request failed — failing open:", error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
