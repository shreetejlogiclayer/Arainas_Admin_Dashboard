import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminShell from "./components/AdminShell";
import { Loading } from "./components/Feedback";
import { api } from "./lib/api";
import DetailPage from "./pages/DetailPage";
import MemberEditorModal from "./components/MemberEditorModal";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import RecordsPage from "./pages/RecordsPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import SettingsPage from "./pages/SettingsPage";

function AdminRoutes({ user, onLogout, newOrderIds, dismissed, notification, onDismiss, error, onRetry }) {
  const [overview, setOverview] = useState(null);
  const [overviewOrders, setOverviewOrders] = useState(null);
  const [result, setResult] = useState(null);
  const [record, setRecord] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deletingMember, setDeletingMember] = useState(false);
  const [memberDeleteMessage, setMemberDeleteMessage] = useState("");
  const [memberDeleteError, setMemberDeleteError] = useState("");
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [memberUpdateMessage, setMemberUpdateMessage] = useState("");
  const deleteDialogRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, search: "", status: "", payment: "", from: "", to: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const searchTimer = useRef();
  const isMemberDetail = location.pathname.startsWith("/members/");
  const isOrderDetail = location.pathname.startsWith("/orders/");
  const isOverview = location.pathname === "/overview";
  const isMembers = location.pathname === "/members";
  const isOrders = location.pathname === "/orders";
  const isCustomerOrders = location.pathname === "/customer-orders";
  const pageType = isMembers ? "members" : isCustomerOrders ? "customer-orders" : "orders";
  const recordId = (isMemberDetail || isOrderDetail) ? decodeURIComponent(location.pathname.split("/").at(-1)) : "";

  const load = useCallback(async () => {
    if (!isOverview && !isMembers && !isOrders && !isCustomerOrders && !isMemberDetail && !isOrderDetail) return;
    setLoading(true);
    try {
      if (isOverview) {
        const [summary, recent] = await Promise.all([
          api("/overview"),
          api("/orders?page=1&limit=5"),
        ]);
        setOverview(summary);
        setOverviewOrders(recent);
      } else if (isMembers || isOrders || isCustomerOrders) {
        const query = new URLSearchParams({
          page: String(filters.page),
          limit: "10",
          search: filters.search,
          ...(isOrders || isCustomerOrders ? { from: filters.from, to: filters.to } : {}),
        });
        setResult(await api(`/${pageType}?${query}`));
      } else {
        const type = isMemberDetail ? "members" : "orders";
        setRecord(await api(`/${type}/${encodeURIComponent(recordId)}`));
      }
      onRetry(null);
    } catch (loadError) {
      onRetry(loadError);
    } finally {
      setLoading(false);
    }
  }, [filters, isCustomerOrders, isMemberDetail, isMembers, isOrderDetail, isOrders, isOverview, pageType, recordId, onRetry]);

  useEffect(() => {
    if (isMembers || isOrders || isCustomerOrders) setFilters({ page: 1, search: "", status: "", payment: "", from: "", to: "" });
    if (isMemberDetail || isOrderDetail) setRecord(null);
  }, [location.pathname, isCustomerOrders, isMemberDetail, isMembers, isOrderDetail, isOrders]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isOverview && !isOrders) return undefined;
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [isOrders, isOverview, load]);

  function changeFilter(key, value) {
    if (key === "search") {
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setFilters((current) => ({ ...current, search: value, page: 1 })), 300);
      return;
    }
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  function resetCustomerOrderFilters() {
    clearTimeout(searchTimer.current);
    setFilters((current) => ({ ...current, page: 1, search: "", from: "", to: "" }));
  }

  async function confirmDeleteMember() {
    if (!memberToDelete || deletingMember) return;
    const member = memberToDelete;
    const name = member.profile?.fullName || member.email || member.mobile || "Member";
    setDeletingMember(true);
    setMemberDeleteError("");
    try {
      const deletion = await api(`/members/${encodeURIComponent(member.id)}`, { method: "DELETE" });
      if (isMemberDetail) {
        navigate("/members", { replace: true });
      } else {
        setResult((current) => current ? {
          ...current,
          items: current.items.filter((item) => item.id !== member.id),
          total: Math.max(0, current.total - 1),
        } : current);
        if (result?.items?.length === 1 && filters.page > 1) {
          setFilters((current) => ({ ...current, page: current.page - 1 }));
        }
      }
      setMemberToDelete(null);
      setMemberDeleteMessage(`${name} and their related account data were permanently deleted.${deletion.warning ? ` ${deletion.warning}` : ""}`);
      onRetry(null);
    } catch (deleteError) {
      setMemberDeleteError(deleteError.message || "Unable to delete this member. Please try again.");
    } finally {
      setDeletingMember(false);
    }
  }

  function openDeleteMember(member) {
    setMemberDeleteMessage("");
    setMemberDeleteError("");
    setMemberToDelete(member);
  }

  useEffect(() => {
    if (!memberToDelete) return undefined;
    deleteDialogRef.current?.focus();
    function closeOnEscape(event) {
      if (event.key === "Escape" && !deletingMember) setMemberToDelete(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [memberToDelete, deletingMember]);

  useEffect(() => {
    if (!memberUpdateMessage) return undefined;
    const timer = setTimeout(() => setMemberUpdateMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [memberUpdateMessage]);

  function openEditMember(member) {
    setMemberUpdateMessage("");
    setMemberToEdit(member);
  }

  async function saveMemberChanges(changes) {
    const updated = await api(`/members/${encodeURIComponent(memberToEdit.id)}`, {
      method: "PUT",
      body: JSON.stringify(changes),
    });
    setResult((current) => current ? {
      ...current,
      items: current.items.map((item) => item.id === updated.id
        ? { ...item, ...updated, profile: { ...item.profile, ...updated.profile } }
        : item),
    } : current);
    setRecord((current) => current?.id === updated.id
      ? { ...current, ...updated, profile: { ...current.profile, ...updated.profile } }
      : current);
    setMemberToEdit(null);
    setMemberUpdateMessage({ text: `${updated.profile?.fullName || "Member"} updated successfully.` });
    onRetry(null);
  }

  return (
    <AdminShell user={user} newOrders={newOrderIds.size} notification={notification} onDismiss={onDismiss} onLogout={onLogout} error={error} onRetry={load}>
      {memberUpdateMessage && <div className="notification" role="status">{memberUpdateMessage.text}</div>}
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={loading && !overview ? <Loading /> : <OverviewPage overview={overview} orders={overviewOrders} onRefresh={load} onOpenOrder={(id) => navigate(`/orders/${encodeURIComponent(id)}`)} newOrderIds={newOrderIds} dismissed={dismissed} />} />
        <Route path="/members" element={loading && !result ? <Loading /> : <RecordsPage type="members" result={result} onPage={(page) => setFilters((current) => ({ ...current, page }))} onFilter={changeFilter} onOpen={(id) => navigate(`/members/${encodeURIComponent(id)}`)} onEditMember={user?.role === "admin" ? openEditMember : undefined} onDeleteMember={user?.role === "admin" ? openDeleteMember : undefined} deleteMessage={memberDeleteMessage} />} />
        <Route path="/orders" element={loading && !result ? <Loading /> : <RecordsPage type="orders" result={result} onPage={(page) => setFilters((current) => ({ ...current, page }))} onFilter={changeFilter} onOpen={(id) => navigate(`/orders/${encodeURIComponent(id)}`)} newOrderIds={newOrderIds} dismissed={dismissed} />} />
        <Route path="/customer-orders" element={loading && !result ? <Loading /> : <CustomerOrdersPage result={result} filters={filters} onPage={(page) => setFilters((current) => ({ ...current, page }))} onFilter={changeFilter} onReset={resetCustomerOrderFilters} onError={onRetry} />} />
        <Route path="/settings" element={user?.role === "admin" ? <SettingsPage user={user} /> : <Navigate to="/overview" replace />} />
        <Route path="/members/:id" element={<DetailPage type="member" record={record} loading={loading} error={error} onEditMember={user?.role === "admin" ? openEditMember : undefined} onDeleteMember={user?.role === "admin" ? openDeleteMember : undefined} onOpenOrder={(id) => navigate(`/orders/${encodeURIComponent(id)}`)} />} />
        <Route path="/orders/:id" element={<DetailPage type="order" record={record} loading={loading} error={error} />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
      {memberToDelete && (
        <div className="confirm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingMember) setMemberToDelete(null); }}>
          <section ref={deleteDialogRef} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-member-title" aria-describedby="delete-member-description" tabIndex="-1">
            <span className="confirm-icon"><Trash2 size={21} /></span>
            <h2 id="delete-member-title">Delete member?</h2>
            <p id="delete-member-description">
              Permanently delete <strong>{memberToDelete.profile?.fullName || memberToDelete.email || memberToDelete.mobile || "this member"}</strong> and their profile, addresses, referrals, coupons, orders, and account data? This cannot be undone.
            </p>
            {memberDeleteError && <div className="login-error" role="alert">{memberDeleteError}</div>}
            <div className="confirm-actions">
              <button className="button button-secondary" type="button" onClick={() => setMemberToDelete(null)} disabled={deletingMember}>Cancel</button>
              <button className="button button-danger" type="button" onClick={confirmDeleteMember} disabled={deletingMember}>
                <Trash2 size={15} /> {deletingMember ? "Deleting…" : "Delete member"}
              </button>
            </div>
          </section>
        </div>
      )}
      {memberToEdit && <MemberEditorModal member={memberToEdit} onClose={() => setMemberToEdit(null)} onSave={saveMemberChanges} />}
    </AdminShell>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [notification, setNotification] = useState("");
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [dismissed, setDismissed] = useState(new Set());
  const seenOrders = useRef(null);
  const navigate = useNavigate();

  const handleError = useCallback((error) => {
    setGlobalError(error ? error.message || String(error) : "");
  }, []);

  useEffect(() => {
    api("/me")
      .then((session) => {
        setCurrentUser(session.user);
        setAuthenticated(true);
        setGlobalError("");
      })
      .catch((error) => {
        if (!error.message.includes("Admin sign-in required")) setLoginError(error.message);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const checkNewOrders = useCallback(async (baseline = false) => {
    const latest = await api("/orders?page=1&limit=50");
    const currentIds = new Set(latest.items.map((order) => order.id));
    const previous = seenOrders.current;
    const fresh = previous
      ? latest.items.filter((order) => !previous.has(order.id) && order.orderStatus === "pending")
      : latest.items.filter((order) => order.orderStatus === "pending" && Date.now() - new Date(order.createdAt).getTime() < 24 * 60 * 60 * 1000);
    if (fresh.length) {
      setNewOrderIds((current) => new Set([...current, ...fresh.map((order) => order.id)]));
      setDismissed((current) => {
        const next = new Set(current);
        fresh.forEach((order) => next.delete(order.id));
        return next;
      });
      if (previous && !baseline) setNotification(`${fresh.length} new order${fresh.length > 1 ? "s" : ""} received.`);
    }
    seenOrders.current = currentIds;
  }, []);

  useEffect(() => {
    if (!authenticated) return undefined;
    checkNewOrders(true).catch(handleError);
    const timer = setInterval(() => {
      checkNewOrders().catch(handleError);
    }, 20000);
    return () => clearInterval(timer);
  }, [authenticated, checkNewOrders, handleError]);

  async function login(email, password) {
    try {
      const session = await api("/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setCurrentUser(session.user);
      setAuthenticated(true);
      setLoginError("");
      setGlobalError("");
      navigate("/overview", { replace: true });
    } catch (error) {
      setLoginError(error.message);
    }
  }

  async function logout() {
    try {
      await api("/logout", { method: "POST" });
    } finally {
      setAuthenticated(false);
      setCurrentUser(null);
      setGlobalError("");
      setNewOrderIds(new Set());
      setDismissed(new Set());
      seenOrders.current = null;
      navigate("/login", { replace: true });
    }
  }

  function dismissNotification() {
    setNotification("");
    setDismissed((current) => new Set([...current, ...newOrderIds]));
  }

  if (checkingSession) return <Loading label="Checking secure session…" />;
  if (!authenticated) return <LoginPage onLogin={login} error={loginError} />;
  return <AdminRoutes user={currentUser} onLogout={logout} newOrderIds={newOrderIds} dismissed={dismissed} notification={notification} onDismiss={dismissNotification} error={globalError} onRetry={handleError} />;
}
