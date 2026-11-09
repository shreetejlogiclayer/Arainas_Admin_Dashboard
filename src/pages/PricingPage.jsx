import { Check, LoaderCircle, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api, formatMoney } from "../lib/api";
import { Loading } from "../components/Feedback";

export default function PricingPage() {
  const [tiers, setTiers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const current = await api("/pricing");
      setTiers(current);
      setDrafts(Object.fromEntries(current.map((tier) => [tier.boxes, String(tier.pricePerBox)])));
    } catch (loadError) {
      setError(loadError.message || "Unable to load product pricing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const isValid = tiers.length === 5 && tiers.every((tier) => {
    const price = Number(drafts[tier.boxes]);
    return Number.isSafeInteger(price) && price >= 1 && price <= tier.maxPricePerBox;
  });
  const hasChanges = tiers.some((tier) => Number(drafts[tier.boxes]) !== tier.pricePerBox);

  async function savePricing(event) {
    event.preventDefault();
    if (!isValid || !hasChanges || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await api("/pricing", {
        method: "PATCH",
        body: JSON.stringify({
          prices: tiers.map((tier) => ({ boxes: tier.boxes, pricePerBox: Number(drafts[tier.boxes]) })),
        }),
      });
      setTiers(updated);
      setDrafts(Object.fromEntries(updated.map((tier) => [tier.boxes, String(tier.pricePerBox)])));
      setMessage("Mega Box prices updated. The customer order form will refresh automatically.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update product pricing.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !tiers.length) return <Loading label="Loading product prices…" />;

  return (
    <>
      <div className="page-intro pricing-intro">
        <div>
          <p className="page-description">Update the executive rate for each Mega Box option. Changes are used for new orders.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={loadPricing} disabled={loading || saving}>
          <RefreshCw size={15} /> Refresh prices
        </button>
      </div>
      {error && <div className="login-error" role="alert">{error}</div>}
      {message && <div className="notification" role="status"><Check size={16} />{message}</div>}
      {tiers.length === 5 && (
        <form className="pricing-editor" onSubmit={savePricing}>
          <div className="pricing-grid">
            {tiers.map((tier) => {
              const price = Number(drafts[tier.boxes]);
              const validPrice = Number.isSafeInteger(price) && price >= 1 && price <= tier.maxPricePerBox;
              return (
                <section className="detail-card pricing-card" key={tier.boxes}>
                  <div className="pricing-card-heading">
                    <span className="pricing-quantity">{tier.boxes}</span>
                    <div><h2>{tier.boxes} Mega {tier.boxes === 1 ? "Box" : "Boxes"}</h2><p>Order total at this rate</p></div>
                  </div>
                  <div className="pricing-current">
                    <span>Current rate / Mega Box</span>
                    <strong>{formatMoney(tier.pricePerBox)}</strong>
                  </div>
                  <label className="pricing-input-label" htmlFor={`mega-box-price-${tier.boxes}`}>New rate / Mega Box</label>
                  <div className="pricing-input-wrap">
                    <span>₹</span>
                    <input
                      id={`mega-box-price-${tier.boxes}`}
                      type="number"
                      min="1"
                      max={tier.maxPricePerBox}
                      step="1"
                      inputMode="numeric"
                      required
                      value={drafts[tier.boxes] ?? ""}
                      onChange={(event) => {
                        setDrafts((current) => ({ ...current, [tier.boxes]: event.target.value }));
                        setMessage("");
                      }}
                      aria-invalid={!validPrice}
                    />
                  </div>
                  {!validPrice && <p className="pricing-field-error">Enter a whole amount from ₹1 to {formatMoney(tier.maxPricePerBox)}.</p>}
                  <div className="pricing-total"><span>{tier.boxes} × new rate</span><strong>{validPrice ? formatMoney(tier.boxes * price) : "—"}</strong></div>
                </section>
              );
            })}
          </div>
          <div className="pricing-submit">
            <p>Prices apply to new orders only. Existing orders keep their saved price.</p>
            <button className="button button-primary" type="submit" disabled={!isValid || !hasChanges || saving}>
              {saving ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}
              {saving ? "Saving prices…" : "Save all prices"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
