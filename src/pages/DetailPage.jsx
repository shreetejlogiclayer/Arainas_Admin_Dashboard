import { ArrowLeft, MapPin, PackageCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import RecordsTable from "../components/RecordsTable";
import OrderPdfButton from "../components/OrderPdfButton";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatMoney } from "../lib/api";
import { EmptyState, Loading } from "../components/Feedback";

function Field({ label, children }) {
  return <div className="detail-row"><dt>{label}</dt><dd>{children || "—"}</dd></div>;
}

function Address({ address }) {
  if (!address) return <p className="muted">No delivery address is recorded.</p>;
  return <p className="address-text">{[address.houseNumber, address.building, address.street, address.area, address.landmark, address.village, address.city, address.district, address.state, address.pinCode, address.country].filter(Boolean).join(", ")}</p>;
}

export default function DetailPage({ type, record, loading, error, onOpenOrder }) {
  const isMember = type === "member";
  const back = isMember ? "/members" : "/orders";
  if (loading) return <Loading label={`Loading ${type}…`} />;
  if (error || !record) return <EmptyState title={error || `${type} not found.`} action="Back to list" onRetry={() => window.location.assign(back)} />;

  if (isMember) {
    const member = record;
    return (
      <>
        <Link to={back} className="back-link"><ArrowLeft size={16} /> Back to members</Link>
        <div className="detail-heading"><div><span className="eyebrow">MEMBER PROFILE</span><h2>{member.profile?.fullName || "Name not added"}</h2><p>{member.mobile} {member.email && `· ${member.email}`}</p></div><StatusBadge value={member.status} /></div>
        <div className="detail-grid">
          <section className="detail-card"><div className="detail-card-title"><UserRound size={17} /><span>Account</span></div><dl><Field label="Registered">{formatDate(member.createdAt, true)}</Field><Field label="Account status"><StatusBadge value={member.status} /></Field><Field label="Email">{member.email}</Field><Field label="Mobile">{member.mobile}</Field></dl></section>
          <section className="detail-card"><div className="detail-card-title"><UserRound size={17} /><span>Portal profile</span></div><dl><Field label="Profile name">{member.profile?.fullName}</Field><Field label="Alternate mobile">{member.profile?.alternateMobile}</Field><Field label="Referral code">{member.profile?.referralCode}</Field></dl></section>
          <section className="detail-card full"><div className="detail-card-title"><MapPin size={17} /><span>Saved addresses</span></div>{member.addresses?.length ? <div className="address-grid">{member.addresses.map((address, index) => <article className="address-card" key={address.id || index}>{address.isDefault && <span className="default-tag">DEFAULT</span>}<strong>{[address.houseNumber, address.building, address.street].filter(Boolean).join(", ")}</strong><p>{[address.area, address.landmark, address.village, address.city, address.district, address.state, address.pinCode, address.country].filter(Boolean).join(", ")}</p></article>)}</div> : <p className="muted">No saved addresses.</p>}</section>
          <section className="detail-card full"><div className="detail-card-title"><PackageCheck size={17} /><span>Order history · {member.orders?.length || 0}</span></div>{member.orders?.length ? <RecordsTable items={member.orders} type="orders" onOpen={onOpenOrder} /> : <p className="muted">No orders on record.</p>}</section>
        </div>
      </>
    );
  }

  const order = record;
  return (
    <>
      <Link to={back} className="back-link"><ArrowLeft size={16} /> Back to orders</Link>
      <div className="detail-heading"><div><span className="eyebrow">ORDER DETAIL</span><h2>{order.orderNumber}</h2><p>Placed {formatDate(order.createdAt, true)}</p></div><div className="order-detail-actions"><div className="badge-stack"><StatusBadge value={order.orderStatus} /><StatusBadge value={order.paymentStatus} /></div><OrderPdfButton order={order} /></div></div>
      <div className="detail-grid">
        <section className="detail-card"><div className="detail-card-title"><UserRound size={17} /><span>Customer</span></div><h3>{order.orderedByName || "—"}</h3><p>{order.orderedByMobile || order.user?.mobile || "—"}</p><p>{order.user?.email || ""}</p><p>Account: {order.user?.profile?.fullName || "—"}</p></section>
        <section className="detail-card"><div className="detail-card-title"><MapPin size={17} /><span>Delivery recipient</span></div><h3>{order.deliveryRecipientName || "—"}</h3><p>{order.deliveryAddress?.recipientMobile || "—"}</p><p>Order placed for: {order.recipientType || "—"}</p><Address address={order.deliveryAddress} /></section>
        <section className="detail-card full"><div className="detail-card-title"><PackageCheck size={17} /><span>Items</span></div><div className="table-card"><div className="table-scroll"><table><thead><tr><th>PRODUCT</th><th>VARIANT</th><th>QUANTITY</th><th>PRICE / BOX</th><th>SUBTOTAL</th></tr></thead><tbody>{(order.items || []).map((item, index) => <tr key={item.id || index}><td><strong>{item.productNameSnapshot}</strong></td><td>{item.sizeSnapshot}</td><td>{item.quantityBoxes}</td><td>{formatMoney(item.pricePerBoxSnapshot)}</td><td><strong>{formatMoney(item.subtotal)}</strong></td></tr>)}</tbody></table></div></div><div className="totals"><div>Subtotal <strong>{formatMoney(order.subtotal)}</strong></div><div>Discount <strong>− {formatMoney(order.discount)}</strong></div><div className="total-row">Order total <strong>{formatMoney(order.total)}</strong></div></div></section>
        <section className="detail-card"><div className="detail-card-title"><span>Order timestamps</span></div><dl><Field label="Created">{formatDate(order.createdAt, true)}</Field><Field label="Last updated">{formatDate(order.updatedAt, true)}</Field></dl></section>
        <section className="detail-card sender-card"><div className="detail-card-title"><span>Sender · invoice details</span></div><h3>ARAINA</h3><strong>Royo Essentials LLP</strong><p>Bramhavrunda Colony, Pimple Nilakh, Pune - 411027</p><p>+91 8006345123 · care@arainas.com</p></section>
      </div>
    </>
  );
}
