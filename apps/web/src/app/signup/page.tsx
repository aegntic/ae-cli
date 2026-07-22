"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import CopyButton from "@/components/CopyButton";
import { API_KEY_STORAGE, signupRequest, signupConfirm } from "@/lib/api";

/**
 * /signup — self-service account activation.
 *
 * Email -> 6-digit code -> workspace + one-time API key. The key is saved to
 * localStorage (the same `aegntic_api_key` the console reads) and the user is
 * routed to /app. This is the only page a cold visitor needs to reach a working
 * balance; no account system, no password.
 *
 * Copy says "free test credit" only — never the dollar amount.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 swiss-line-b bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-10 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={26} />
          </Link>
          <Link
            href="/app"
            className="text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            I have a key →
          </Link>
        </div>
      </header>

      <main className="px-5 md:px-10 pt-10 pb-24">
        <div className="mx-auto max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            create account
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-tight md:text-5xl">
            Start with <span className="italic text-accent">free test credit.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary">
            Verify your email and we&apos;ll spin up a workspace, mint your first API key,
            and add free test credit so you can run tools right away. No card, no account.
          </p>

          <div className="mt-10">
            <SignupFlow />
          </div>
        </div>
      </main>
    </div>
  );
}

type Step = "email" | "code" | "done";

function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalize(raw: string): string {
    return raw.trim().toLowerCase();
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const addr = normalize(email);
    if (!addr.includes("@") || addr.length < 5) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await signupRequest(addr);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const addr = normalize(email);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const result = await signupConfirm(addr, code.trim());
      setApiKey(result.apiKey);
      // Persist to the shared localStorage key the console reads.
      if (typeof window !== "undefined") {
        window.localStorage.setItem(API_KEY_STORAGE, result.apiKey);
      }
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-3xl border-2 border-border bg-bg-elevated p-7 toy-shadow md:p-9">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-bg px-3 py-1 text-xs text-text-secondary toy-shadow-sm">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Workspace ready
        </span>
        <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight">
          You&apos;re in. Save your key.
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          This is your only API key — copy it now. It&apos;s stored in this browser so the
          console is ready, with free test credit to start.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-border bg-bg p-1">
          <code className="flex-1 overflow-x-auto px-4 py-3 font-mono text-[13px] text-text-secondary">
            {apiKey}
          </code>
          <CopyButton text={apiKey} eventName="signup_key_copied" />
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            className="toy-button bg-accent px-6 py-3 text-sm font-bold text-white"
            onClick={() => router.push("/app")}
          >
            Open console →
          </button>
          <Link
            href="/start"
            className="rounded-2xl border-2 border-border bg-bg px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:text-accent"
          >
            See the quickstart
          </Link>
        </div>
      </div>
    );
  }

  const isEmailStep = step === "email";

  return (
    <form
      onSubmit={isEmailStep ? handleRequest : handleConfirm}
      className="rounded-3xl border-2 border-border bg-bg-elevated p-7 toy-shadow md:p-9"
      noValidate
    >
      {/* Honeypot: hidden from humans; a bot filling it is silently ignored. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        onChange={() => {}}
      />

      {isEmailStep ? (
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          disabled={busy}
        />
      ) : (
        <div>
          <p className="text-sm text-text-secondary">
            We sent a 6-digit code to <span className="font-mono text-text-primary">{normalize(email)}</span>.
          </p>
          <div className="mt-4">
            <Field
              id="code"
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={setCode}
              disabled={busy}
              maxLength={6}
            />
          </div>
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-accent transition-colors hover:text-accent-dim"
            onClick={() => {
              setStep("email");
              setError(null);
              setCode("");
            }}
            disabled={busy}
          >
            ← use a different email
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl border-2 border-toy-red/40 bg-toy-red/5 px-3 py-2 text-sm text-toy-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="toy-button mt-6 w-full bg-accent px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy
          ? isEmailStep
            ? "Sending..."
            : "Verifying..."
          : isEmailStep
            ? "Send verification code →"
            : "Verify & create workspace →"}
      </button>

      <p className="mt-4 text-center text-xs text-text-muted">
        By signing up you get free test credit to try aedex. Top up later only if you need more.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  maxLength,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  maxLength?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full rounded-2xl border-2 border-border bg-bg px-4 py-3 font-mono text-[15px] text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent"
        {...rest}
      />
    </div>
  );
}
