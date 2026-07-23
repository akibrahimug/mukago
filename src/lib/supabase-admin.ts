import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role client — bypasses RLS by design. Only ever imported from
// server-only code (route handlers). The browser never talks to Supabase
// directly, so no anon key or client-side SDK is needed anywhere.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    // Bound every request instead of relying solely on the platform's
    // function-execution timeout — a stuck/half-up Postgres shouldn't be
    // able to hang the signup request (and the serverless invocation that's
    // billed for it) indefinitely.
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
  },
});
