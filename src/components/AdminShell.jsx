import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, LayoutDashboard, LogOut, Menu, Package, Users, UserRoundSearch, X } from "lucide-react";
import { useState } from "react";
import { ErrorBanner } from "./Feedback";

const navigation = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/customer-orders", label: "Customer orders", icon: UserRoundSearch },
];

export default function AdminShell({ children, user, newOrders = 0, notification, onDismiss, onLogout, error, onRetry }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const title = navigation.find((item) => location.pathname.startsWith(item.to))?.label || "Overview";
  const displayName = user?.name || (user?.role === "manager" ? "Manager" : "Admin");
  const initials = displayName === "Admin 1" ? "A1" : displayName === "Admin 2" ? "A2" : displayName === "Manager" ? "M" : "A";

  return (
    <div className="app-shell">
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <button className="mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        <button className="brand" onClick={() => navigate("/overview")} aria-label="ARAINA admin overview">
          <img className="brand-logo" src="/assets/images/araina-logo-dark.png" alt="ARAINA — Empowering to Rise" />
        </button>
        <div className="workspace-tag"><span className="workspace-dot" /> ADMIN WORKSPACE</div>
        <div className="nav-caption">MANAGEMENT</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Orders" && newOrders > 0 && <span className="nav-count">{newOrders}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-profile">
            <span className="admin-avatar">{initials}</span>
            <span className="admin-profile-copy"><strong>{displayName}</strong><small><span className="account-dot" /> {user?.role === "manager" ? "Manager" : "Admin"}</small></span>
          </div>
          <button className="signout-button" onClick={onLogout}><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="topbar-heading">
            <span className="eyebrow">ROYO ESSENTIALS LLP</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-status"><span className="live-dot" /> Live <span className="status-divider">·</span> refreshes every 20 sec</div>
        </header>
        <div className="page-content">
          {notification && (
            <div className="notification" role="status">
              <Bell size={17} />
              <span>{notification}</span>
              <button onClick={onDismiss} aria-label="Dismiss notification"><X size={17} /></button>
            </div>
          )}
          <ErrorBanner message={error} onRetry={onRetry} />
          {children}
        </div>
      </main>
    </div>
  );
}
