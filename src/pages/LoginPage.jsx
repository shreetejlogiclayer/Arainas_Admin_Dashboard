import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState("admin@arainas.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  useEffect(() => setErrorDismissed(false), [error]);

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setErrorDismissed(false);
    setSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" aria-hidden="true" />
      <div className="login-decoration decoration-two" aria-hidden="true" />
      <div className="login-layout">
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-brand">
            <img className="brand-logo" src="/assets/images/araina-logo-dark.png" alt="ARAINA — Empowering to Rise" />
            <span className="login-brand-divider" />
            <span className="brand-copy"><small>ADMIN CONSOLE</small><strong>PORTAL</strong></span>
          </div>
          <div className="login-intro">
            <span className="eyebrow"><span className="login-lock"><LockKeyhole size={13} /></span> SECURE ADMIN ACCESS</span>
            <h1 id="login-title">Welcome back</h1>
          </div>
          {error && !errorDismissed && <div className="login-error" role="alert"><span className="login-error-mark">!</span><span>{error}</span></div>}
          <form onSubmit={submit} className="login-form">
            <label htmlFor="email">Admin email</label>
            <div className="login-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck="false" required maxLength={255} placeholder="admin@arainas.com" value={email} onChange={(event) => { setEmail(event.target.value); setErrorDismissed(true); }} disabled={submitting} />
            </div>
            <div className="password-label-row"><label htmlFor="password">Password</label></div>
            <div className="login-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => { setPassword(event.target.value); setErrorDismissed(true); }} disabled={submitting} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={submitting}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button className="button button-primary login-submit" type="submit" disabled={submitting || !email.trim() || !password}>
              {submitting ? <><LoaderCircle className="spin" size={17} /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>
          <div className="login-footnote"><ShieldCheck size={16} /><span>Restricted to provisioned administrator accounts</span></div>
        </section>
        <footer className="login-footer"><span>ARAINA</span><i /> ROYO ESSENTIALS LLP <i /> ADMINISTRATION</footer>
      </div>
    </main>
  );
}
