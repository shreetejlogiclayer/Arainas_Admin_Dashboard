import { ArrowUpRight, ChevronDown, PackageOpen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDate, formatMoney } from "../lib/api";
import StatusBadge from "./StatusBadge";
import OrderPdfButton from "./OrderPdfButton";

export default function RecordsTable({ items = [], type, newOrderIds = new Set(), dismissed = new Set(), downloadedParcelOrderIds = new Set(), onParcelPdfDownloaded, onOpen, onDeleteMember, onEditMember, onUpdateOrderStatus }) {
  const [updatingOrderIds, setUpdatingOrderIds] = useState(new Set());
  const [orderStatusError, setOrderStatusError] = useState(null);

  async function updateOrderStatus(order, orderStatus) {
    setUpdatingOrderIds((current) => new Set(current).add(order.id));
    setOrderStatusError(null);
    try {
      await onUpdateOrderStatus(order.id, orderStatus);
    } catch (error) {
      setOrderStatusError({ orderId: order.id, message: error.message || "Unable to update order status." });
    } finally {
      setUpdatingOrderIds((current) => {
        const next = new Set(current);
        next.delete(order.id);
        return next;
      });
    }
  }

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
        <thead><tr><th>MEMBER</th><th>MOBILE</th><th>EMAIL</th><th>STATUS</th><th>REGISTERED</th><th>ACTION</th></tr></thead>
        <tbody>{items.map((member) => (
          <tr key={member.id} className="clickable-row" onClick={() => onOpen(member.id)}>
            <td><strong>{member.profile?.fullName || "Name not added"}</strong><small className="subline">{member.profile?.referralCode || "Portal member"}</small></td>
            <td>{member.mobile || "—"}</td><td>{member.email || "—"}</td><td><StatusBadge value={member.status} /></td>
            <td>{formatDate(member.createdAt)}</td>
            <td><div className="member-row-actions"><button className="icon-button" aria-label={`Open ${member.profile?.fullName || "member"} details`} onClick={(event) => { event.stopPropagation(); onOpen(member.id); }}><ArrowUpRight className="row-arrow" size={16} /></button>{onEditMember && <button className="icon-button edit-member-button" aria-label={`Edit ${member.profile?.fullName || "member"}`} onClick={(event) => { event.stopPropagation(); onEditMember(member); }}><Pencil size={15} /></button>}{onDeleteMember && <button className="icon-button delete-member-button" aria-label={`Delete ${member.profile?.fullName || "member"}`} onClick={(event) => { event.stopPropagation(); onDeleteMember(member); }}><Trash2 size={16} /></button>}</div></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    );
  }

  return (
    <div className="table-card"><div className="table-scroll"><table>
      <thead><tr><th>ORDER</th><th>ORDERED BY</th><th>RECIPIENT</th><th>DATE</th><th>AMOUNT</th><th>PAYMENT STATUS</th><th>ACTION</th><th>ORDER STATUS</th></tr></thead>
      <tbody>{items.map((order) => {
        const downloaded = order.parcelSummaryDownloaded || downloadedParcelOrderIds.has(order.id);
        const isNew = newOrderIds.has(order.id) && !dismissed.has(order.id) && !downloaded;
        return (
          <tr key={order.id} className={`clickable-row${isNew ? " new-order-row" : ""}`} onClick={() => onOpen(order.id)}>
            <td><strong>{order.orderNumber}</strong>{isNew && <small className="new-label">NEW</small>}</td>
            <td>{order.orderedByName || "—"}<small className="subline">{order.orderedByMobile || ""}</small></td>
            <td>{order.deliveryRecipientName || "—"}</td><td>{formatDate(order.createdAt, true)}</td>
            <td><strong>{formatMoney(order.total)}</strong></td>
            <td><StatusBadge value={order.paymentStatus} /></td>
            <td><OrderPdfButton order={order} compact downloaded={downloaded} onDownloaded={onParcelPdfDownloaded} /></td>
            <td>{onUpdateOrderStatus && ["pending", "shipped"].includes(order.orderStatus) ? (
              <div className="order-status-control">
                <span className={`order-status-select-wrap order-status-${order.orderStatus}`}>
                  <select
                    className="order-status-select"
                    aria-label={`Update status for ${order.orderNumber}`}
                    value={order.orderStatus}
                    disabled={updatingOrderIds.has(order.id)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      event.stopPropagation();
                      updateOrderStatus(order, event.target.value);
                    }}
                  >
                    {order.orderStatus === "pending"
                      ? <><option value="pending">Pending</option><option value="shipped">Shipped</option></>
                      : <><option value="shipped">Shipped</option><option value="delivered">Delivered</option></>}
                  </select>
                  <ChevronDown size={13} aria-hidden="true" />
                </span>
                {orderStatusError?.orderId === order.id && <span className="order-status-error" role="alert">{orderStatusError.message}</span>}
              </div>
            ) : <StatusBadge value={order.orderStatus} />}</td>
          </tr>
        );
      })}</tbody>
    </table></div></div>
  );
}
