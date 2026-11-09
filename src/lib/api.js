export async function api(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...options.headers },
    ...options,
  });
  const responseText = await response.text();
  let result = {};
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    if (response.ok) {
      throw new Error("The API server returned an invalid response. Check the dashboard API configuration.");
    }
  }
  if (!response.ok) {
    const message = result.error?.message
      || (responseText && !response.headers.get("content-type")?.includes("text/html")
        ? responseText.slice(0, 200)
        : `The API server returned HTTP ${response.status}. Check the dashboard API configuration.`);
    throw new Error(message);
  }
  return result.data;
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" } : {}),
      }).format(parsed);
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatCount(value) {
  return Number(value || 0).toLocaleString("en-IN");
}
