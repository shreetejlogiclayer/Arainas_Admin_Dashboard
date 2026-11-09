import { CalendarDays, Download, RotateCcw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api, formatCount, formatDate } from "../lib/api";
import { createCustomerOrdersWorkbook } from "../lib/customerOrdersExcel";
import Pagination from "../components/Pagination";

export default function CustomerOrdersPage({ result, filters, onPage, onFilter, onReset, onError }) {
  const [search, setSearch] = useState(filters.search);
  const [exporting, setExporting] = useState(false);

  useEffect(() => setSearch(filters.search), [filters.search]);
  const hasFilters = Boolean(search || filters.search || filters.from || filters.to || filters.orderedThisMonth);

  async function exportCustomers() {
    setExporting(true);
    try {
      const query = new URLSearchParams({
        page: "1",
        limit: "50",
        search: filters.search,
        from: filters.from,
        to: filters.to,
        orderedThisMonth: filters.orderedThisMonth,
      });
      const firstPage = await api(`/customer-orders?${query}`);
      const customers = [...firstPage.items];
      const pages = Math.ceil(firstPage.total / firstPage.pageSize);
      for (let page = 2; page <= pages; page += 1) {
        query.set("page", String(page));
        const nextPage = await api(`/customer-orders?${query}`);
        customers.push(...nextPage.items);
      }
      downloadExcel(customers);
    } catch (error) {
      onError(error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="page-intro list-intro">
        <button className="button button-primary" onClick={exportCustomers} disabled={exporting || !result?.total}>
          <Download size={15} /> {exporting ? "Preparing Excel…" : "Download Excel"}
        </button>
      </div>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search customers"
            placeholder="Search customer name or mobile"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              onFilter("search", event.target.value);
            }}
          />
        </label>
        <label className="date-filter">
          <CalendarDays size={15} />
          <span>From</span>
          <input aria-label="Orders from date" type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => onFilter("from", event.target.value)} />
        </label>
        <label className="date-filter">
          <span>To</span>
          <input aria-label="Orders to date" type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => onFilter("to", event.target.value)} />
        </label>
        <label className="select-filter">
          <CalendarDays size={15} />
          <select aria-label="Filter customers by orders this month" value={filters.orderedThisMonth} onChange={(event) => onFilter("orderedThisMonth", event.target.value)}>
            <option value="">All customers</option>
            <option value="yes">Ordered this month: Yes</option>
            <option value="no">Ordered this month: No</option>
          </select>
        </label>
        <button className="button button-secondary" onClick={() => { setSearch(""); onReset(); }} disabled={!hasFilters}>
          <RotateCcw size={15} /> Reset filters
        </button>
        <span className="record-count">{formatCount(result?.total)} customers</span>
      </div>
      {result?.items?.length ? (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>CUSTOMER</th><th>MOBILE</th><th>NUMBER OF ORDERS</th><th>LAST ORDER DATE</th><th>LAST ORDER BOXES</th><th>ORDERED THIS MONTH</th></tr>
              </thead>
              <tbody>
                {result.items.map((customer) => (
                  <tr key={customer.id}>
                    <td><strong>{customer.name || "Name not added"}</strong></td>
                    <td>{customer.mobile || "—"}</td>
                    <td><strong>{formatCount(customer.orderCount)}</strong></td>
                    <td>{formatDate(customer.lastOrderAt)}</td>
                    <td>{formatCount(customer.lastOrderBoxes)}</td>
                    <td><span className={`month-order-badge ${customer.orderedThisMonth ? "yes" : "no"}`}>{customer.orderedThisMonth ? "Yes" : "No"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Users size={21} /></span>
          <strong>No customer orders found</strong>
        </div>
      )}
      <Pagination result={result} onPage={onPage} />
    </>
  );
}

function downloadExcel(customers) {
  const archive = createCustomerOrdersWorkbook(customers);
  const blob = new Blob([archive], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `customer-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
