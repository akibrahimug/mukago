# Mukago

Landing page and Founding Fifty signup for Mukago (mukago.co.uk) — Next.js App Router,
server-first, static-rendered marketing page + a hardened signup API route.

The original static prototype (`index.html` / `styles.css` / `script.js`) is kept untouched in
[`reference/`](./reference) for comparison.

## Stack

- **Next.js 16** (App Router, TypeScript) — the marketing page is a Server Component with only
  two small Client Components (the reveal-on-scroll wrapper and the signup form), so it prerenders
  to static HTML at build time and ships almost no JS.
- **[Resend](https://resend.com)** — sends the "welcome to the Founding Fifty" auto-reply and
  holds the mailing list as a Resend Audience.
- **[Supabase](https://supabase.com) (Postgres)** — durable record of every signup, independent
  of Resend, written only via the service-role key from the server (RLS denies the browser
  entirely — there is no client-side Supabase code anywhere in this app).
- **[Upstash Redis](https://upstash.com)** — per-IP rate limiting on `/api/signup` via
  `@upstash/ratelimit`.
- **[react-email](https://react.email)** — the welcome email and admin-notification templates,
  styled to match the site.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Resend

1. Create an account at [resend.com](https://resend.com) and grab an API key from
   **API Keys** → paste into `RESEND_API_KEY`.
2. Create an audience under **Audiences** (e.g. "Founding Fifty") and paste its ID into
   `RESEND_AUDIENCE_ID`.
3. Until you verify your own sending domain under **Domains**, set
   `RESEND_FROM_EMAIL=Mukago <onboarding@resend.dev>` — Resend's shared test address. It only
   delivers to the email address your Resend account is registered with, which is enough to test
   the full flow end to end. Once `mukago.co.uk` is verified, switch to
   `Mukago <hello@mukago.co.uk>` (or whichever address you want) — no code changes needed.
4. Set `ADMIN_EMAIL` to whichever inbox should get a notification every time someone new signs
   up (see [`emails/new-subscriber-notification.tsx`](./emails/new-subscriber-notification.tsx)).
   It's sent best-effort, after the visitor's own welcome email, and never blocks or fails their
   signup response.

### 3. Supabase

This project already has a hosted Supabase project (`mukago`, ref `azfdzxjbmtkberhblvif`,
`eu-west-1`). Run the migration in [`supabase/migrations`](./supabase/migrations) against it with
`supabase link --project-ref azfdzxjbmtkberhblvif && supabase db push`, then copy `SUPABASE_URL`
and the `service_role` key from that project's Settings → API page into `.env.local`. The
`service_role` key is a separate secret from the DB password and isn't obtainable from it.

Alternatively, for fully local development against a throwaway database:

**Local** — requires Docker:

```bash
supabase start
```

This applies the migration automatically and prints a local `API URL` and `service_role` key —
copy those into `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. Local ports were shifted from
Supabase's defaults (see `supabase/config.toml`) to `544*1`–`544*9` to avoid clashing with other
Supabase projects that might already be running on this machine.

**Hosted** — create a project at [supabase.com](https://supabase.com), then either run
`supabase link` + `supabase db push`, or paste the contents of the migration file into the SQL
editor. Copy the project's API URL and `service_role` key (Settings → API) into `.env.local`.
Never use the `anon` key here — this app is designed so the browser never talks to Supabase at
all; only the server-side service-role key is used, and RLS is enabled with zero policies so
`anon`/`authenticated` get no access even if that key ever leaked.

### 4. Upstash Redis

Create a free Redis database at [console.upstash.com](https://console.upstash.com), then copy the
**REST URL** and **REST Token** from its dashboard into `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`. In development, if these are left unset the rate limiter logs a
warning and lets requests through; in production the app throws on boot if they're missing —
`/api/signup` is not allowed to run unthrottled once it's public.

The Upstash free tier only allows one database per account without adding billing. If that
account already has a database from another project, it's fine to reuse it here — this app
namespaces every key it touches under the `mukago:signup:*` prefix (see
[`src/lib/ratelimit.ts`](./src/lib/ratelimit.ts)), so it can't collide with or meaningfully affect
that other project's usage. Create a dedicated database instead once/if billing is added.

### 5. Environment

```bash
cp .env.example .env.local
# fill in the values from steps 2-4
```

### 6. Run it

```bash
pnpm dev          # http://localhost:3000
pnpm email:dev    # live preview of the welcome email at http://localhost:3001
```

## Security notes

- All third-party credentials (Resend, Supabase, Upstash) are read through
  [`src/lib/env.ts`](./src/lib/env.ts), which is `server-only` and validated with Zod at process
  start — a missing/malformed var fails loudly instead of breaking silently in production.
- `/api/signup` (see [`src/app/api/signup/route.ts`](./src/app/api/signup/route.ts)):
  - Rejects cross-origin POSTs (Origin header checked against Host).
  - Rate-limited per IP (5 attempts / 10 minutes via Upstash).
  - Honeypot field (`company`) — bots that fill it in get an indistinguishable fake-success
    response, no Supabase write, no email sent.
  - Validates and normalizes the email server-side with Zod — the client-side check is only for
    instant feedback and is never trusted.
  - Duplicate signups are treated as idempotent (no second welcome email sent).
  - If Resend fails after the Supabase insert succeeds, the lead is still captured — the failure
    is logged server-side and `welcome_email_sent_at` stays `null` on that row as a marker for
    manual follow-up, rather than telling the visitor their signup failed when it didn't.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are set in `next.config.ts`. The CSP allows
  `'unsafe-inline'` scripts/styles rather than per-request nonces — this page renders zero
  user-generated or CMS-sourced content, so there's no injection surface for a nonce to guard
  against, and nonces would force the whole page into dynamic rendering (they must be fresh per
  request), which conflicts with keeping it static and CDN-fast. Revisit this if the page ever
  renders dynamic/user-sourced content.
- No secrets are ever sent to the browser: Resend/Supabase/Upstash credentials are read only in
  server-only modules, and there is no client-side SDK for any of them.

## Suggested follow-ups (not built yet)

- A real one-click unsubscribe route (currently a `mailto:` link in the welcome email) if/when you
  start sending recurring updates via Resend Broadcasts.
- An `opengraph-image` for nicer link previews when the page is shared.

## Deploying

Push to a Git repo and import it on [Vercel](https://vercel.com/new), or run `vercel deploy`.
Set every variable from `.env.example` in the project's Environment Variables settings — the app
will refuse to boot in production without `UPSTASH_REDIS_REST_URL`/`_TOKEN`, and API calls will
fail without valid Resend/Supabase credentials.
