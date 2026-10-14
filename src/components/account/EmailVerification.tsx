"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authApi } from "@/lib/api";
import { apiMessage } from "@/lib/format";

export const VERIFY_NOTICE = "Confirm your email to use exchange credit and see past orders.";
const COOLDOWN_MS = 60_000;

/** Shared across every "Resend email" button on the page so the bar and the credit panel cool down together. */
let cooldownUntil = 0;
const listeners = new Set<() => void>();

/** "Resend email": POST /auth/resend-verification, then disabled for 60 s with a countdown. */
export function useResendVerification() {
  const { user } = useAuth();
  const toast = useToast();
  const [, force] = useState(0);
  const [busy, setBusy] = useState(false);
  const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));

  useEffect(() => {
    const on = () => force((n) => n + 1);
    listeners.add(on);
    return () => void listeners.delete(on);
  }, []);
  useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => force((n) => n + 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);

  const resend = useCallback(async () => {
    setBusy(true);
    try {
      const r = await authApi.resendVerification();
      cooldownUntil = Date.now() + COOLDOWN_MS;
      listeners.forEach((l) => l());
      toast.show({ message: r.sent ? `New link sent to ${user?.email ?? "your email"}.` : "A link is already on its way — check your inbox." });
    } catch (e) {
      toast.show({ message: apiMessage(e), tone: "error" });
    } finally {
      setBusy(false);
    }
  }, [toast, user?.email]);

  return { resend, busy, left, disabled: busy || left > 0, label: busy ? "Sending…" : left > 0 ? `Resend in ${left}s` : "Resend email" };
}

/** Slim bar across the top of account pages while the email is unconfirmed. */
export function VerifyNoticeBar() {
  const r = useResendVerification();
  return (
    <div className="verify-bar" role="region" aria-label="Confirm your email">
      <div className="container verify-bar__inner">
        <p className="verify-bar__text">
          <span className="mono-label verify-bar__label">Action needed</span>
          <span>{VERIFY_NOTICE}</span>
        </p>
        <button type="button" className="btn btn--ghost verify-bar__btn" onClick={r.resend} disabled={r.disabled}>
          {r.label}
        </button>
      </div>
    </div>
  );
}

/** Replaces the exchange-credit card for unverified accounts: no balance is shown until the email is confirmed. */
export function CreditLocked() {
  const r = useResendVerification();
  return (
    <div className="credit-locked">
      <div className="credit-locked__top">
        <span className="mono-label">EXCHANGE CREDIT</span>
        <span className="mono-label credit-locked__state">LOCKED</span>
      </div>
      <div className="credit-locked__bottom">
        <div className="serif credit-locked__title">
          Confirm your <em>email</em>
        </div>
        <p className="credit-locked__copy">{VERIFY_NOTICE}</p>
        <button type="button" className="ap-link small-link credit-locked__btn" onClick={r.resend} disabled={r.disabled}>
          {r.label}
        </button>
      </div>
    </div>
  );
}

type Phase = "checking" | "done" | "failed";

/** /account?view=verify&token=… — confirms the email, then continues to the account. */
export function VerifyEmailView({ token, onVerified }: { token: string; onVerified?: () => void | Promise<void> }) {
  const router = useRouter();
  const { status, user, refreshUser } = useAuth();
  const [phase, setPhase] = useState<Phase>("checking");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        if (!token) throw new Error("This link is invalid or has expired");
        await authApi.verifyEmail(token);
        setPhase("done");
      } catch (e) {
        setError(apiMessage(e));
        setPhase("failed");
      }
    })();
  }, [token]);

  // Once the session has loaded, pull the fresh user (emailVerified, credit) into the account.
  useEffect(() => {
    if (phase === "done" && status === "authed") {
      void refreshUser();
      void onVerified?.();
    }
  }, [phase, status, refreshUser, onVerified]);

  const resend = useResendVerification();
  const canResend = phase === "failed" && status === "authed" && user && !user.emailVerified;

  return (
    <div className="container verify">
      <div className="verify__body" aria-live="polite" aria-busy={phase === "checking"}>
        {phase === "checking" && (
          <>
            <div className="mono-label">ACCOUNT · CONFIRMING</div>
            <h1 className="serif verify__title">
              One <em>moment.</em>
            </h1>
            <p className="body-copy">Confirming your email address…</p>
          </>
        )}
        {phase === "done" && (
          <>
            <div className="mono-label">ACCOUNT · EMAIL CONFIRMED</div>
            <h1 className="serif verify__title">
              You&apos;re <em>confirmed.</em>
            </h1>
            <p className="body-copy">Your exchange credit and past orders are now linked to your account.</p>
            <button type="button" className="btn btn--block verify__cta" onClick={() => router.replace("/account")}>
              <span>{status === "authed" ? "Continue to account" : "Sign in to continue"}</span>
              <span aria-hidden>→</span>
            </button>
          </>
        )}
        {phase === "failed" && (
          <>
            <div className="mono-label">ACCOUNT · LINK EXPIRED</div>
            <h1 className="serif verify__title">
              Link <em>expired.</em>
            </h1>
            <p className="body-copy">{error ?? "This link is invalid or has expired"}. Links are valid for 24 hours and can be used once.</p>
            {canResend ? (
              <button type="button" className="btn btn--block verify__cta" onClick={resend.resend} disabled={resend.disabled}>
                <span>{resend.left > 0 ? resend.label : "Send a new link"}</span>
                <span aria-hidden>→</span>
              </button>
            ) : (
              <button type="button" className="btn btn--block verify__cta" onClick={() => router.replace("/account")}>
                <span>{status === "authed" ? "Continue to account" : "Sign in"}</span>
                <span aria-hidden>→</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
