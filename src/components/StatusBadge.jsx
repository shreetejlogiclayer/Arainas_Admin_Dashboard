export default function StatusBadge({ value }) {
  const label = String(value || "unknown").replaceAll("_", " ");
  const kind = label.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return <span className={`badge badge-${kind}`}>{label}</span>;
}
