import { ArrowUpRight, PackageOpen } from "lucide-react";
import { formatDate, formatMoney } from "../lib/api";
import StatusBadge from "./StatusBadge";
import OrderPdfButton from "./OrderPdfButton";

export default function RecordsTable({ items = [], type, newOrderIds = new Set(), dismissed = new Set(), onOpen }) {
  if (!items.length) {
    return (
      <div className="empty-state inline-empty">
        <span className="empty-icon"><PackageOpen size={21} /></span>
        <strong>No {type === "orders" ? "orders" : "members"} to show</strong>
      </div>
    );
  }

  if (type === "members") {
    return (
      <div className="table-card"><div className="table-scroll"><table>
        <thead><tr><th>MEMBER</th><th>MOBILE</th><th>EMAIL</th><th>STATUS</th><th>REGISTERED</th><th /></tr></thead>
        <tbody>{items.map((member) => (
          <tr key={member.id} className="clickable-row" onClick={() => onOpen(member.id)}>
            <td><strong>{member.profile?.fullName || "Name not added"}</strong><small className="subline">{member.profile?.referralCode || "Portal member"}</small></td>
            <td>{member.mobile || "—"}</td><td>{member.email || "—"}</td><td><StatusBadge value={member.status} /></td>
            <td>{formatDate(member.createdAt)}</td><td><ArrowUpRight className="row-arrow" size={16} /></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    );
  }

  return (
    <div className="table-card"><div className="table-scroll"><table>
      <thead><tr><th>ORDER</th><th>ORDERED BY</th><th>RECIPIENT</th><th>DATE</th><th>AMOUNT</th><th>ORDER STATUS</th><th>PAYMENT</th><th>ACTION</th></tr></thead>
      <tbody>{items.map((order) => {
        const isNew = newOrderIds.has(order.id) && !dismissed.has(order.id);
        return (
          <tr key={order.id} className={`clickable-row${isNew ? " new-order-row" : ""}`} onClick={() => onOpen(order.id)}>
            <td><strong>{order.orderNumber}</strong>{isNew && <small className="new-label">NEW</small>}</td>
            <td>{order.orderedByName || "—"}<small className="subline">{order.orderedByMobile || ""}</small></td>
            <td>{order.deliveryRecipientName || "—"}</td><td>{formatDate(order.createdAt, true)}</td>
            <td><strong>{formatMoney(order.total)}</strong></td><td><StatusBadge value={order.orderStatus} /></td><td><StatusBadge value={order.paymentStatus} /></td><td><OrderPdfButton order={order} compact /></td>
          </tr>
        );
      })}</tbody>
    </table></div></div>
  );
}
