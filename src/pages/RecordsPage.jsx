import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import RecordsTable from "../components/RecordsTable";

export default function RecordsPage({ type, result, onPage, onFilter, onOpen, onDeleteMember, onEditMember, deleteMessage, newOrderIds, dismissed }) {
  const [search, setSearch] = useState("");
  const isOrders = type === "orders";
  useEffect(() => setSearch(""), [type]);
  return (
    <>
      <div className="page-intro list-intro">
        <span className="record-count">{result?.total ?? 0} {type}</span>
      </div>
      {deleteMessage && <div className="notification" role="status">{deleteMessage}</div>}
      <div className="filter-bar">
        <label className="search-field"><Search size={17} /><input aria-label={isOrders ? "Search orders" : "Search members"} placeholder={isOrders ? "Search order, customer or recipient" : "Search name, mobile or email"} value={search} onChange={(event) => { setSearch(event.target.value); onFilter("search", event.target.value); }} /></label>
        {isOrders && <>
          <label className="select-filter"><SlidersHorizontal size={15} /><select aria-label="Filter order status" onChange={(event) => onFilter("status", event.target.value)} defaultValue=""><option value="">All order statuses</option>{["pending", "processing", "shipped", "delivered", "cancelled"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="select-filter"><select aria-label="Filter payment status" onChange={(event) => onFilter("payment", event.target.value)} defaultValue=""><option value="">All payment statuses</option>{["not_configured", "pending", "success", "failed"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="date-filter"><span>From</span><input aria-label="Orders from date" type="date" onChange={(event) => onFilter("from", event.target.value)} /></label>
          <label className="date-filter"><span>To</span><input aria-label="Orders to date" type="date" onChange={(event) => onFilter("to", event.target.value)} /></label>
        </>}
      </div>
      <RecordsTable items={result?.items || []} type={type} onOpen={onOpen} onDeleteMember={onDeleteMember} onEditMember={onEditMember} newOrderIds={newOrderIds} dismissed={dismissed} />
      <Pagination result={result} onPage={onPage} />
    </>
  );
}
