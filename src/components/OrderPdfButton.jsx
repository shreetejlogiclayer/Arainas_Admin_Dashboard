import { FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";
import { createOrderPdf } from "../lib/orderPdf";

export default function OrderPdfButton({ order, orderId, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download(event) {
    event?.stopPropagation();
    if (busy) return;
    const pdfWindow = window.open("about:blank", "_blank");
    if (!pdfWindow) {
      setError("Allow pop-ups to open the parcel PDF in a new tab.");
      return;
    }
    pdfWindow.document.title = "Preparing parcel PDF";
    pdfWindow.document.body.textContent = "Preparing your parcel PDF…";
    setBusy(true);
    setError("");
    try {
      const hasDetails = order?.items && Object.hasOwn(order, "deliveryAddress");
      const completeOrder = hasDetails
        ? order
        : await api(`/orders/${encodeURIComponent(order?.id || orderId)}`);
      const pdf = await createOrderPdf(completeOrder);
      const pdfUrl = URL.createObjectURL(pdf);
      pdfWindow.location.replace(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (downloadError) {
      pdfWindow.close();
      setError(downloadError.message || "Unable to create the order PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="order-pdf-action">
      <button className={`button button-secondary pdf-button${compact ? " pdf-button-compact" : ""}`} type="button" onClick={download} disabled={busy} aria-label={`Open parcel PDF for ${order?.orderNumber || "order"}`} title="Open parcel PDF in a new tab">
        {busy ? <LoaderCircle className="spin" size={15} /> : <FileText size={15} />}
        {!compact && (busy ? "Preparing PDF…" : "Open parcel PDF")}
      </button>
      {error && <span className="pdf-error" role="alert">{error}</span>}
    </span>
  );
}
