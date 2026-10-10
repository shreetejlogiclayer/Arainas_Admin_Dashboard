import { ArrowRight, ArrowUpRight, CircleDollarSign, RefreshCw, ShoppingBag, Users, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import RecordsTable from "../components/RecordsTable";
import StatusBadge from "../components/StatusBadge";
import { formatCount } from "../lib/api";

const icons = [Users, UserRoundCheck, ShoppingBag, CircleDollarSign];

export default function OverviewPage({ overview, orders, onRefresh, onOpenOrder, newOrderIds, dismissed }) {
  if (!overview) return null;
  const stats = [
    { label: "Registered members", value: overview.members.total, tone: "pink" },
    { label: "Active members", value: overview.members.active, tone: "blue" },
    { label: "Total orders", value: overview.orders.total, tone: "ink" },
    { label: "New orders · 24h", value: overview.orders.new, tone: "gold" },
  ];
  const statuses = Object.entries(overview.orders.byStatus || {});
  return (
    <>
      <div className="page-intro">
        <button className="button button-secondary" onClick={onRefresh}><RefreshCw size={15} /> Refresh</button>
      </div>
      <section className="stat-grid" aria-label="Portal summary">
        {stats.map(({ label, value, tone }, index) => {
          const Icon = icons[index];
          return <article className="stat-card" key={label}>
            <div className="stat-card-heading"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></span></div>
            <strong>{formatCount(value)}</strong>
          </article>;
        })}
      </section>
      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">ORDER HEALTH</span><h2>Orders by status</h2></div><Link className="text-link" to="/orders">View all orders <ArrowRight size={15} /></Link></div>
        <div className="status-grid">{statuses.length ? statuses.map(([name, count]) => <div className="status-tile" key={name}><StatusBadge value={name} /><strong>{formatCount(count)}</strong></div>) : <p className="muted">No order data available.</p>}</div>
      </section>
      <aside className="notice-card"><span className="notice-icon"><CircleDollarSign size={19} /></span><div><strong>Payments are not configured in the portal</strong></div></aside>
      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">LATEST ACTIVITY</span><h2>Recent orders</h2></div><Link className="text-link" to="/orders">Open orders <ArrowUpRight size={15} /></Link></div>
        <RecordsTable items={orders?.items?.slice(0, 5) || []} type="orders" onOpen={onOpenOrder} newOrderIds={newOrderIds} dismissed={dismissed} />
      </section>
    </>
  );
}
