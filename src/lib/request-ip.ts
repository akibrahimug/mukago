import "server-only";

// Vercel (and most reverse proxies) set x-forwarded-for at the edge and
// strip/overwrite any client-supplied value, so trusting the first entry is
// safe there. If this ever runs behind a different proxy, verify the same
// holds before relying on it for rate limiting.
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
