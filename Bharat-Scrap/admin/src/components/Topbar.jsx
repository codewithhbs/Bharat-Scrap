import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const routeTitles = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics",
  "/clients": "All Clients",
  "/users": "All Users",

  "/leads": "Leads",
  "/contracts": "Contracts",
  "/projects": "Active Projects",
  "/invoices": "Invoices",
  "/reports": "Reports",
  "/team": "Team",
  "/settings": "Settings",
};

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = routeTitles[location.pathname] || "Admin";

  return (
    <header className="topbar">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            color: "var(--ink)",
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div>
          <h1
            className="font-display"
            style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--ink)", margin: 0, lineHeight: 1 }}
          >
            {pageTitle}
          </h1>
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0, marginTop: 2 }}>
            Bharat Scrap — Admin Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #b8975a, #8a6e3e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#0f0e0c",
            cursor: "pointer",
            border: "2px solid var(--parchment-dark)",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
};

export default Topbar;