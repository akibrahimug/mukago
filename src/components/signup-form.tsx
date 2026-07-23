"use client";

import { useId, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

const DEFAULT_FINE =
  "A few emails a year as the farm grows. First refusal on Batch 001. Nothing else.";
const GENERIC_ERROR = "Something went wrong on our end. Mind trying again in a moment?";
const INVALID_EMAIL = "That email doesn’t look right. Mind checking it?";
const RATE_LIMITED = "Too many attempts. Give it a few minutes and try again.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupResponse {
  ok: boolean;
  duplicate?: boolean;
  message?: string;
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(DEFAULT_FINE);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatus("error");
      setMessage(INVALID_EMAIL);
      return;
    }

    setStatus("loading");
    setMessage(DEFAULT_FINE);

    const honeypot = formRef.current
      ? String(new FormData(formRef.current).get("company") ?? "")
      : "";

    let httpStatus = 0;
    let result: SignupResponse | null = null;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, company: honeypot }),
      });
      httpStatus = res.status;
      result = (await res.json().catch(() => null)) as SignupResponse | null;
    } catch {
      setStatus("error");
      setMessage(GENERIC_ERROR);
      return;
    }

    if (httpStatus === 429) {
      setStatus("error");
      setMessage(RATE_LIMITED);
      return;
    }

    if (!result?.ok) {
      setStatus("error");
      setMessage(result?.message ?? GENERIC_ERROR);
      return;
    }

    const nextStatus: Status = result.duplicate ? "duplicate" : "success";
    setStatus(nextStatus);
    setMessage(
      result.message ??
        (result.duplicate
          ? "You’re already one of the Founding Fifty. No need to sign twice."
          : "Pact signed. Check your inbox, we’ve sent you a note."),
    );
    setEmail("");

    window.setTimeout(() => {
      setStatus("idle");
      setMessage(DEFAULT_FINE);
    }, 5000);
  }

  const busy = status === "loading";
  const isPositive = status === "success" || status === "duplicate";

  return (
    <>
      <form ref={formRef} className="signup__form" onSubmit={handleSubmit} noValidate>
        <label className="sr-only" htmlFor="email">
          Email address
        </label>
        <input
          className="signup__input"
          type="email"
          id="email"
          name="email"
          placeholder="you@somewhere.com"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
        />

        {/* Honeypot: hidden from real visitors via CSS, but present in the
            DOM for simple bots that fill in every field they find. Real
            users never see or fill this in, so we treat any non-empty
            value as spam server-side. */}
        <div className="signup__hp" aria-hidden="true">
          <label htmlFor={honeypotId}>Company</label>
          <input
            id={honeypotId}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button className="signup__submit" type="submit" disabled={busy}>
          {busy ? "Signing…" : "Sign the pact"}
        </button>
      </form>
      <p
        className={`signup__fine ${isPositive ? "is-success" : ""} ${
          status === "error" ? "is-error" : ""
        }`.trim()}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </>
  );
}
