"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckRow, FieldBox } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { apiMessage, toE164NG } from "@/lib/format";

type View = "signin" | "register" | "forgot" | "reset";

/** ACC-1: sign in / register / forgot / reset — one page, switched by ?view= */
export function AuthForms() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get("view") as View) || (params.get("token") ? "reset" : "signin");
  const [view, setViewState] = useState<View>(["signin", "register", "forgot", "reset"].includes(initial) ? initial : "signin");
  const setView = (v: View) => {
    setViewState(v);
    setError(null);
    setInfo(null);
    const q = new URLSearchParams(params.toString());
    if (v === "signin") q.delete("view");
    else q.set("view", v);
    router.replace(`/account${q.toString() ? `?${q}` : ""}`, { scroll: false });
  };
  const { login, register } = useAuth();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const next = params.get("next");

  const after = () => {
    if (next && next.startsWith("/")) router.push(next);
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(apiMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<View, [string, string]> = {
    signin: ["Welcome", "back"],
    register: ["Create an", "account"],
    forgot: ["Forgot your", "password?"],
    reset: ["Choose a new", "password"],
  };

  return (
    <div className="container auth">
      <div className="auth__intro">
        <div className="mono-label">ACCOUNT</div>
        <h1 className="serif auth__title">
          {titles[view][0]} <em>{titles[view][1]}</em>
        </h1>
        <p className="body-copy">Track orders, request exchanges, spend exchange credit and keep your addresses for faster checkout.</p>
        <ul className="auth__perks">
          <li><span className="mono-xs">01</span> Order history and tracking</li>
          <li><span className="mono-xs">02</span> Exchange credit, applied at checkout</li>
          <li><span className="mono-xs">03</span> Saved addresses and pieces</li>
        </ul>
        <p className="mono-xs">
          ORDERED AS A GUEST? <Link href="/orders/lookup" className="ap-link">LOOK UP YOUR ORDER</Link>
        </p>
      </div>

      <div className="auth__panel">
        {(view === "signin" || view === "register") && (
          <div role="tablist" className="auth__tabs">
            <button role="tab" aria-selected={view === "signin"} className={`tab${view === "signin" ? " is-on" : ""}`} onClick={() => setView("signin")}>Sign in</button>
            <button role="tab" aria-selected={view === "register"} className={`tab${view === "register" ? " is-on" : ""}`} onClick={() => setView("register")}>Create account</button>
          </div>
        )}

        {view === "signin" && (
          <form className="stack gap-12" onSubmit={(e) => { e.preventDefault(); run(async () => { await login(email.trim(), password); after(); }); }}>
            <FieldBox label="EMAIL" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FieldBox label="PASSWORD" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn btn--block" disabled={busy}><span>{busy ? "Signing in…" : "Sign in"}</span><span aria-hidden>→</span></button>
            <button type="button" className="ap-link small-link auth__link" onClick={() => setView("forgot")}>Forgot your password?</button>
          </form>
        )}

        {view === "register" && (
          <form
            className="stack gap-12"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 8) return setError("Use at least 8 characters for your password.");
              if (phone && !toE164NG(phone)) return setError("Enter a Nigerian phone number, e.g. 0803 000 0000.");
              run(async () => {
                await register({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone ? toE164NG(phone)! : undefined, marketingConsent: consent });
                after();
              });
            }}
          >
            <div className="field-grid field-grid--200">
              <FieldBox label="FIRST NAME" autoComplete="given-name" value={firstName} onChange={(e) => setFirst(e.target.value)} required />
              <FieldBox label="LAST NAME" autoComplete="family-name" value={lastName} onChange={(e) => setLast(e.target.value)} required />
            </div>
            <FieldBox label="EMAIL" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FieldBox label="PHONE · +234 · OPTIONAL" type="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <FieldBox label="PASSWORD · 8+ CHARACTERS" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <CheckRow checked={consent} onChange={setConsent} id="reg-consent" sub="OPTIONAL · UNSUBSCRIBE ANY TIME">Email me about new drops and private sales</CheckRow>
            <p className="mono-xs">
              BY CREATING AN ACCOUNT YOU AGREE TO OUR <Link href="/policies/terms" className="ap-link">TERMS</Link> AND <Link href="/policies/privacy" className="ap-link">PRIVACY POLICY</Link>.
            </p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="btn btn--block" disabled={busy}><span>{busy ? "Creating…" : "Create account"}</span><span aria-hidden>→</span></button>
          </form>
        )}

        {view === "forgot" && (
          <form className="stack gap-12" onSubmit={(e) => { e.preventDefault(); run(async () => { await authApi.forgot(email.trim()); setInfo("If there's an account for that email, a reset link is on its way."); }); }}>
            <p className="body-copy">Enter your email and we&apos;ll send a link to reset your password.</p>
            <FieldBox label="EMAIL" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            {info && <p className="form-ok" role="status">{info}</p>}
            <button className="btn btn--block" disabled={busy}><span>Send reset link</span><span aria-hidden>→</span></button>
            <button type="button" className="ap-link small-link auth__link" onClick={() => setView("signin")}>← Back to sign in</button>
          </form>
        )}

        {view === "reset" && (
          <form
            className="stack gap-12"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length < 8) return setError("Use at least 8 characters.");
              run(async () => {
                await authApi.reset(params.get("token") ?? "", password);
                setInfo("Password updated. You can sign in now.");
                setPassword("");
              });
            }}
          >
            <FieldBox label="NEW PASSWORD · 8+ CHARACTERS" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            {info && <p className="form-ok" role="status">{info}</p>}
            <button className="btn btn--block" disabled={busy}><span>Save password</span><span aria-hidden>→</span></button>
            <button type="button" className="ap-link small-link auth__link" onClick={() => setView("signin")}>Sign in →</button>
          </form>
        )}
      </div>
    </div>
  );
}
