import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkSignupRateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request-ip";
import { WelcomeEmail } from "@emails/welcome-email";
import { NewSubscriberNotification } from "@emails/new-subscriber-notification";

const SUPABASE_UNIQUE_VIOLATION = "23505";

const bodySchema = z.object({
  email: z.email("That email doesn’t look right."),
  // Honeypot — real visitors never see or fill this field in (see
  // signup-form.tsx). Anything non-empty here means a bot filled the form.
  company: z.string().optional().default(""),
});

const GENERIC_ERROR_MESSAGE = "Something went wrong on our end. Mind trying again in a moment?";
const SUCCESS_MESSAGE = "Pact signed. Check your inbox, we’ve sent you a note.";
const DUPLICATE_MESSAGE = "You’re already one of the Founding Fifty. No need to sign twice.";

function fakeSuccess() {
  // Bots that fill the honeypot get an indistinguishable "success" response
  // so scrapers can't use the response to fingerprint our spam defenses.
  return NextResponse.json({ ok: true, duplicate: false, message: SUCCESS_MESSAGE });
}

export async function POST(request: Request) {
  try {
    return await handleSignup(request);
  } catch (error) {
    // Belt-and-braces: any unexpected throw (a network abort, a library
    // surprise) still gets a clean JSON error instead of leaking a raw
    // framework error page to the visitor.
    console.error("[signup] Unhandled error:", error);
    return NextResponse.json({ ok: false, message: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}

async function handleSignup(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      // malformed Origin header — fall through and reject below
    }
    if (originHost !== host) {
      return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
    }
  }

  const ip = getClientIp(request.headers);
  const { success: withinLimit } = await checkSignupRateLimit(ip);
  if (!withinLimit) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Give it a few minutes and try again." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "That email doesn’t look right. Mind checking it?" },
      { status: 400 },
    );
  }

  if (parsed.data.company.trim().length > 0) {
    return fakeSuccess();
  }

  const email = parsed.data.email.trim().toLowerCase();

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("subscribers")
    .insert({ email, source: "landing_page" })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === SUPABASE_UNIQUE_VIOLATION) {
      return NextResponse.json({ ok: true, duplicate: true, message: DUPLICATE_MESSAGE });
    }

    console.error("[signup] Supabase insert failed:", insertError);
    return NextResponse.json({ ok: false, message: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }

  // The Resend SDK reports API-level failures via a returned `{ error }`
  // field rather than throwing (only network-level failures throw), so each
  // call is checked explicitly instead of relying on try/catch to catch it.
  const { error: contactError } = await resend.contacts.create({
    email,
    audienceId: env.RESEND_AUDIENCE_ID,
    unsubscribed: false,
  });
  if (contactError) {
    console.error("[signup] Resend audience add failed for a captured lead:", contactError);
  }

  const { error: sendError } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "The pact is signed. Welcome to the Founding Fifty.",
    react: WelcomeEmail({ email }),
  });

  if (sendError) {
    // The signup itself succeeded and is durably stored in Supabase — an
    // email hiccup shouldn't make the visitor think signup failed. Log
    // loudly so it can be found and the welcome email resent by hand;
    // `welcome_email_sent_at` staying null on this row is the marker.
    console.error("[signup] Resend send failed for a captured lead:", sendError);
  } else {
    await supabaseAdmin
      .from("subscribers")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", inserted.id);
  }

  // Best-effort admin notification — never blocks or fails the visitor's
  // signup response either way.
  const { error: notifyError } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: env.ADMIN_EMAIL,
    subject: `New Founding Fifty signup: ${email}`,
    react: NewSubscriberNotification({ email, signedUpAt: new Date().toUTCString() }),
  });
  if (notifyError) {
    console.error("[signup] Admin notification send failed:", notifyError);
  }

  return NextResponse.json({ ok: true, duplicate: false, message: SUCCESS_MESSAGE });
}
