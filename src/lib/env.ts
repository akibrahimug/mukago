import "server-only";
import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z.string().min(1, "RESEND_FROM_EMAIL is required"),
  RESEND_AUDIENCE_ID: z.string().min(1, "RESEND_AUDIENCE_ID is required"),
  ADMIN_EMAIL: z.email("ADMIN_EMAIL must be a valid email address"),
  SUPABASE_URL: z.url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Invalid or missing environment variables: ${missing}. Copy .env.example to .env.local and fill in the values (see README.md).`,
    );
  }

  return parsed.data;
}

// Evaluated once per server process. Only ever imported from server-only
// modules (route handlers, lib/*) — never reaches the client bundle.
export const env = loadEnv();
