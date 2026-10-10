import { AlertCircle, LoaderCircle, SearchX } from "lucide-react";

export function Loading({ label = "Loading secure data…" }) {
  return (
    <div className="loading-panel" role="status">
      <LoaderCircle className="spin" size={20} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, onRetry, action = "Try again" }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><SearchX size={20} /></span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {onRetry && <button className="button button-secondary" onClick={onRetry}>{action}</button>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={17} />
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
