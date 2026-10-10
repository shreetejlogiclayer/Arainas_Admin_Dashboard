import { useEffect, useRef, useState } from "react";
import { Save, UserRound, X } from "lucide-react";

export default function MemberEditorModal({ member, onClose, onSave }) {
  const dialogRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: member.profile?.fullName || "",
    mobile: member.mobile || "",
    alternateMobile: member.profile?.alternateMobile || "",
    email: member.email || "",
    status: member.status || "active",
  });

  useEffect(() => {
    dialogRef.current?.focus();
    function closeOnEscape(event) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, saving]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        email: form.email.trim() || null,
        alternateMobile: form.alternateMobile.trim() || null,
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to update this member. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="confirm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section ref={dialogRef} className="confirm-dialog member-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-member-title" tabIndex="-1">
        <span className="confirm-icon member-edit-icon"><UserRound size={21} /></span>
        <button className="member-edit-close" type="button" aria-label="Close edit member form" onClick={onClose} disabled={saving}><X size={18} /></button>
        <h2 id="edit-member-title">Edit member</h2>
        <form className="settings-form member-edit-form" onSubmit={submit}>
          <label>Full name<input required maxLength={255} autoComplete="name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
          <label>Mobile number<input required type="tel" inputMode="numeric" autoComplete="tel" value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} /></label>
          <label>Alternate mobile<input type="tel" inputMode="numeric" autoComplete="tel-national" value={form.alternateMobile} onChange={(event) => setForm((current) => ({ ...current, alternateMobile: event.target.value }))} /></label>
          <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
          <label>Account status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <div className="confirm-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving}><Save size={15} /> {saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
