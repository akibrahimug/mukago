# Mukago

Landing page and Founding Fifty signup for Mukago (mukago.co.uk) — Next.js App Router,
server-first, static-rendered marketing page + a hardened signup API route.

Mukago is a single-estate Ugandan robusta coffee brand: grown on Ibrahim's own plot in
Kangulumira, Kayunga, and sold directly to UK customers. This site tells that story and collects
early signups ("the Founding Fifty") ahead of first harvest in 2029.

The original static prototype (`index.html` / `styles.css` / `script.js`) is kept untouched in
[`reference/`](./reference) for comparison.

## Stack

- **Next.js 16** (App Router, TypeScript) — the marketing page is a Server Component with only
  two small Client Components (the reveal-on-scroll wrapper and the signup form), so it prerenders
  to static HTML at build time and ships almost no JS.
- **[Resend](https://resend.com)** — sends the welcome auto-reply and an admin notification, and
  holds the mailing list as a Resend Audience. Sending domain `mukago.co.uk` is verified (SPF +
  DKIM), managed via [Namecheap](https://namecheap.com) DNS.
- **[Supabase](https://supabase.com) (Postgres)** — durable record of every signup, independent
  of Resend, written only via the service-role key from the server (RLS denies the browser
  entirely — there is no client-side Supabase code anywhere in this app).
- **[Upstash Redis](https://upstash.com)** — per-IP rate limiting on `/api/signup` via
  `@upstash/ratelimit`.
- **[react-email](https://react.email)** — the welcome and admin-notification email templates,
  styled to match the site.

## How a signup flows

`src/app/api/signup/route.ts` handles `POST /api/signup`:

1. Reject the request if its `Origin` doesn't match `Host` (blocks cross-site POSTs).
2. Rate-limit the requester's IP via Upstash (5 attempts / 10 minutes; fails open if Upstash
   itself is unreachable, so an outage there can't take the whole form down).
3. Validate the body with Zod. A filled-in honeypot field gets a fake "success" response with no
   further side effects, so bots can't tell they were caught.
4. Insert `{ email }` into Supabase's `subscribers` table. A unique-constraint violation is
   treated as an idempotent "already signed up," not an error.
5. Add the contact to the Resend Audience and send the welcome email
   ([`emails/welcome-email.tsx`](./emails/welcome-email.tsx)). Resend reports failures via a
   returned `error` field rather than throwing — both calls are checked explicitly.
   `welcome_email_sent_at` on the row is only set once the send actually succeeds, so a failed
   send is visible and the row is queryable for manual follow-up later.
6. Send a best-effort admin notification to `ADMIN_EMAIL`
   ([`emails/new-subscriber-notification.tsx`](./emails/new-subscriber-notification.tsx)). Never
   blocks or fails the visitor's response.

## Project structure

```
src/app/page.tsx              marketing page (server component, fully static)
src/app/layout.tsx             fonts, metadata
src/app/globals.css            all styling — no CSS-in-JS, no Tailwind
src/app/api/signup/route.ts    the signup endpoint (see above)
src/app/icon.svg               favicon
src/components/signup-form.tsx client component: the email form
src/components/reveal.tsx      client component: scroll-reveal animation
src/lib/env.ts                 Zod-validated server env, fails loudly if misconfigured
src/lib/resend.ts              Resend client
src/lib/supabase-admin.ts      Supabase client (service-role, 8s request timeout)
src/lib/ratelimit.ts           Upstash rate limiter (mukago:signup:* key prefix)
src/lib/request-ip.ts          extracts client IP from headers
emails/welcome-email.tsx       sent to the new subscriber
emails/new-subscriber-notification.tsx  sent to ADMIN_EMAIL
supabase/migrations/           the subscribers table (RLS enabled, zero policies)
reference/                     original static HTML/CSS/JS prototype, untouched
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Resend

Already configured for this project: `mukago.co.uk` is verified (SPF + DKIM), `RESEND_FROM_EMAIL`
sends as `ibrahim@mukago.co.uk`, and there's a `General` audience holding real subscribers. To set
this up from scratch elsewhere:

1. Create an account at [resend.com](https://resend.com) and grab an API key from
   **API Keys** → `RESEND_API_KEY`.
2. Verify a sending domain under **Domains** (add the SPF/DKIM DNS records it gives you), then set
   `RESEND_FROM_EMAIL=Mukago <you@yourdomain>`. Until a domain is verified, you can only send from
   Resend's shared `onboarding@resend.dev`, and only to the email address your Resend account is
   registered with — enough to test the flow end to end.
3. Create an audience under **Audience → Segments** and paste its ID into `RESEND_AUDIENCE_ID`.
4. Set `ADMIN_EMAIL` to whichever inbox should get a notification every time someone new signs up.

### 3. Supabase

This project already has a hosted Supabase project (`mukago`, ref `azfdzxjbmtkberhblvif`,
`eu-west-1`) with the migration applied. Copy `SUPABASE_URL` and the `service_role` key (Settings
→ API — a separate secret from the DB password, not derivable from it) into `.env.local`.

To set this up from scratch: run the migration in [`supabase/migrations`](./supabase/migrations)
against a new project with `supabase link --project-ref <ref> && supabase db push`, or paste it
into the SQL editor. Never use the `anon`/publishable key here — this app is designed so the
browser never talks to Supabase at all, and RLS is enabled with zero policies so `anon`/
`authenticated` get no access even if that key ever leaked.

For fully local development against a throwaway database instead (requires Docker):

```bash
supabase start
```

This applies the migration automatically and prints a local `API URL` and `service_role` key.
Local ports were shifted from Supabase's defaults (see `supabase/config.toml`) to `544*1`–`544*9`
to avoid clashing with other Supabase projects that might already be running on this machine.

### 4. Upstash Redis

This project has a dedicated database (`mukago`, Ireland `eu-west-1`, Pay as You Go, capped at a
**$5/month max budget** in the Upstash dashboard as a safety net — real traffic here costs
fractions of a cent). Copy its **REST URL** and **REST Token** from the dashboard into
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

To set this up from scratch: create a free Redis database at
[console.upstash.com](https://console.upstash.com). In development, if these vars are left unset
the rate limiter logs a warning and lets requests through; in production the app throws on boot if
they're missing — `/api/signup` is not allowed to run unthrottled once it's public. If the account
already has a database from another project and the free tier's one-database limit is in the way,
it's safe to reuse it: every key this app touches is namespaced under `mukago:signup:*`
(`src/lib/ratelimit.ts`), so it can't collide with another project's keys.

### 5. Environment

```bash
cp .env.example .env.local
# fill in the values from steps 2-4
```

### 6. Run it

```bash
pnpm dev          # http://localhost:3000
pnpm email:dev    # live preview of the email templates at http://localhost:3001
```

## Security notes

- All third-party credentials (Resend, Supabase, Upstash) are read through
  [`src/lib/env.ts`](./src/lib/env.ts), which is `server-only` and validated with Zod at process
  start — a missing/malformed var fails loudly instead of breaking silently in production.
- `/api/signup` (see [`src/app/api/signup/route.ts`](./src/app/api/signup/route.ts)):
  - Rejects cross-origin POSTs (Origin header checked against Host).
  - Rate-limited per IP (5 attempts / 10 minutes via Upstash), fails open on a Redis outage rather
    than taking the whole form down, and fails closed at boot in production if unconfigured.
  - Honeypot field (`company`) — bots that fill it in get an indistinguishable fake-success
    response, no Supabase write, no email sent.
  - Validates and normalizes the email server-side with Zod — the client-side check is only for
    instant feedback and is never trusted.
  - Duplicate signups are treated as idempotent (no second welcome email sent).
  - If Resend fails after the Supabase insert succeeds, the lead is still captured — the failure
    is logged server-side and `welcome_email_sent_at` stays `null` on that row as a marker for
    manual follow-up, rather than telling the visitor their signup failed when it didn't.
  - The Supabase client has an 8-second request timeout so a stuck database can't hang the
    endpoint (and the serverless invocation billed for it) indefinitely.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are set in `next.config.ts`. The CSP allows
  `'unsafe-inline'` scripts/styles rather than per-request nonces — this page renders zero
  user-generated or CMS-sourced content, so there's no injection surface for a nonce to guard
  against, and nonces would force the whole page into dynamic rendering (they must be fresh per
  request), which conflicts with keeping it static and CDN-fast. Revisit this if the page ever
  renders dynamic/user-sourced content.
- No secrets are ever sent to the browser: Resend/Supabase/Upstash credentials are read only in
  server-only modules, and there is no client-side SDK for any of them.
- Email templates use only web-safe fonts (no external font requests) — Resend's own deliverability
  checker flags externally-hosted font/image URLs as suspicious, particularly to Gmail.

## Suggested follow-ups (not built yet)

- A real one-click unsubscribe route (currently a `mailto:` link in the welcome email) if/when you
  start sending recurring updates via Resend Broadcasts.
- An `opengraph-image` for nicer link previews when the page is shared.
- Deployment — there's no live URL yet. See below.

## Deploying

Push to a Git repo and import it on [Vercel](https://vercel.com/new), or run `vercel deploy`.
Set every variable from `.env.example` in the project's Environment Variables settings, using the
same real values already in `.env.local` — the app will refuse to boot in production without
`UPSTASH_REDIS_REST_URL`/`_TOKEN`, and API calls will fail without valid Resend/Supabase
credentials.
