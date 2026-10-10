import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { api } from "../lib/api";

export default function SettingsPage({ user }) {
  return (
    <>
      <div className="page-intro list-intro">
        <p className="page-description">{user?.email}</p>
      </div>
      <div className="settings-grid">
        <PasswordForm
          title="Change your password"
          endpoint="/change-password"
          submitLabel="Update password"
        />
        {user?.role === "admin" && (
          <PasswordForm
            title="Change Manager password"
            endpoint="/manager-password"
            currentPasswordLabel="Your current password"
            submitLabel="Update Manager password"
          />
        )}
      </div>
    </>
  );
}

function PasswordForm({ title, endpoint, currentPasswordLabel = "Current password", submitLabel }) {
  const idPrefix = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (newPassword !== confirmation) {
      setIsError(true);
      setMessage("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await api(endpoint, {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setIsError(false);
      setMessage("Password updated successfully.");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="detail-card settings-card">
      <h2>{title}</h2>
      <form className="settings-form" onSubmit={submit}>
        <PasswordField
          id={`${idPrefix}-current`}
          label={currentPasswordLabel}
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          visible={visiblePasswords.current}
          onToggle={() => setVisiblePasswords((current) => ({ ...current, current: !current.current }))}
        />
        <PasswordField
          id={`${idPrefix}-new`}
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          minLength={10}
          visible={visiblePasswords.new}
          onToggle={() => setVisiblePasswords((current) => ({ ...current, new: !current.new }))}
        />
        <PasswordField
          id={`${idPrefix}-confirmation`}
          label="Confirm new password"
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          minLength={10}
          visible={visiblePasswords.confirmation}
          onToggle={() => setVisiblePasswords((current) => ({ ...current, confirmation: !current.confirmation }))}
        />
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Updating…" : submitLabel}
        </button>
        {message && <div className={isError ? "login-error" : "notification"} role={isError ? "alert" : "status"}>{message}</div>}
      </form>
    </section>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete, minLength, visible, onToggle }) {
  return (
    <label htmlFor={id}>
      {label}
      <span className="settings-password-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          className="password-toggle"
          type="button"
          onClick={onToggle}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}
