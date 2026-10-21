import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import {
  Search, ShieldOff, ShieldCheck, Eye, Trash2,
  SlidersHorizontal, X, Users, UserCheck, UserX,
  Phone, MapPin, ChevronLeft, ChevronRight, Recycle,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ROLE_COLORS = {
  user:     { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  craneMan: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  admin:    { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
};

const Badge = ({ children, bg, text, border }) => (
  <span style={{
    background: bg, color: text, border: `1px solid ${border}`,
    borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    letterSpacing: "0.04em", textTransform: "capitalize", whiteSpace: "nowrap",
  }}>{children}</span>
);

const Avatar = ({ user }) => {
  const img = user?.userImage?.img;
  const initials = (user?.name || "U").charAt(0).toUpperCase();
  return img ? (
    <img src={img} alt={user.name} style={{
      width: 38, height: 38, borderRadius: 10, objectFit: "cover",
      flexShrink: 0, border: "1.5px solid #e7f3e8",
    }} />
  ) : (
    <div style={{
      width: 38, height: 38, borderRadius: 10, background: "#dcfce7",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 15, fontWeight: 700, color: "#166534", flexShrink: 0,
    }}>{initials}</div>
  );
};

// Debounce hook for search
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AllListedUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Raw search input (debounced before sending to API)
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [filters, setFilters] = useState({
    role: "", isBlocked: "",
  });
  const [page, setPage]   = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(filters.role            && { role: filters.role }),
        ...(filters.isBlocked !== "" && { isBlocked: filters.isBlocked }),
      };
      const res = await api.get("/admin/users", { params });
      if (res.data.success) {
        setUsers(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset to page 1 when filters/search change
  useEffect(() => { setPage(1); }, [debouncedSearch, filters, limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ role: "", isBlocked: "" });
    setPage(1);
  };

  const activeFiltersCount = [filters.role, filters.isBlocked].filter(Boolean).length;
  const hasActiveFilter = searchInput || filters.role || filters.isBlocked;

  // ── Actions ───────────────────────────────────────────────────
  const confirmBlockUnblock = (user) => {
    const willBlock = !user.isBlocked;
    Swal.fire({
      title: willBlock ? "Block this user?" : "Unblock this user?",
      text: `${user.name} will be ${willBlock ? "blocked" : "unblocked"}.`,
      icon: "question", showCancelButton: true,
      confirmButtonColor: willBlock ? "#ef4444" : "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: willBlock ? "Yes, block!" : "Yes, unblock!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/users/${user._id}/block-unblock`, { isBlocked: willBlock });
          Swal.fire({ icon: "success",
            title: willBlock ? "User Blocked" : "User Unblocked",
            timer: 2000, showConfirmButton: false });
          fetchUsers();
        } catch {
          Swal.fire({ icon: "error", title: "Failed", text: "Could not update user status." });
        }
      }
    });
  };

  const confirmDelete = (user) => {
    Swal.fire({
      title: "Delete user?",
      text: `This will permanently delete ${user.name}. Cannot be undone.`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/users/${user._id}`);
          Swal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
          fetchUsers();
        } catch {
          Swal.fire({ icon: "error", title: "Error", text: "Failed to delete user." });
        }
      }
    });
  };

  // Page numbers to show (max 5, centered around current page)
  const pageNums = (() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end   = Math.min(totalPages, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <div style={{ width: 34, height: 34, background: "#0f2412", borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Recycle size={17} color="#22c55e" />
          </div>
          <span style={{ fontSize: 12, color: "#6b7280", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 600 }}>
            Bharat Scrap · Admin
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.4px" }}>
          User Management
        </h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
          Manage all registered users
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24, maxWidth: 520 }}>
        {[
          { label: "Total Users", value: total, icon: Users,     color: "#166534", bg: "#dcfce7" },
          { label: "Showing",     value: users.length, icon: UserCheck, color: "#065f46", bg: "#d1fae5" },
          { label: "Pages",       value: totalPages,   icon: UserX,     color: "#374151", bg: "#f3f4f6" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e7f3e8",
            borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 380 }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 12,
            top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search name, email, phone, address..."
            style={{ width: "100%", paddingLeft: 38, paddingRight: searchInput ? 36 : 14,
              paddingTop: 10, paddingBottom: 10,
              border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14,
              outline: "none", background: "#fff", color: "#111827", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#16a34a"}
            onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          cursor: "pointer", border: "1.5px solid",
          background:  showFilters || activeFiltersCount > 0 ? "#0f2412" : "#fff",
          borderColor: showFilters || activeFiltersCount > 0 ? "#0f2412" : "#e5e7eb",
          color:       showFilters || activeFiltersCount > 0 ? "#fff"    : "#374151",
          transition: "all 0.15s",
        }}>
          <SlidersHorizontal size={15} />
          Filters
          {activeFiltersCount > 0 && (
            <span style={{ background: "#22c55e", color: "#0f2412", borderRadius: 999,
              width: 18, height: 18, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Rows per page */}
        <select value={limit} onChange={e => setLimit(Number(e.target.value))}
          style={{ padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10,
            fontSize: 14, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" }}>
          {[10, 25, 50].map(n => <option key={n} value={n}>Show {n}</option>)}
        </select>

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
            <div style={{ width: 14, height: 14, border: "2px solid #e5e7eb",
              borderTop: "2px solid #16a34a", borderRadius: "50%",
              animation: "spin 0.7s linear infinite" }} />
            Loading...
          </div>
        )}
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div style={{ background: "#fff", border: "1.5px solid #e7f3e8", borderRadius: 14,
          padding: "20px 22px", marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {/* <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Role</label>
              <select name="role" value={filters.role} onChange={handleFilterChange}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb",
                  borderRadius: 9, fontSize: 14, background: "#fff", outline: "none", color: "#374151" }}>
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="craneMan">Crane Man</option>
                <option value="admin">Admin</option>
              </select>
            </div> */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Account Status</label>
              <select name="isBlocked" value={filters.isBlocked} onChange={handleFilterChange}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb",
                  borderRadius: 9, fontSize: 14, background: "#fff", outline: "none", color: "#374151" }}>
                <option value="">All</option>
                <option value="false">Active</option>
                <option value="true">Blocked</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={clearFilters}
              style={{ display: "flex", alignItems: "center", gap: 5, color: "#ef4444",
                fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
              <X size={14} /> Clear All Filters
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Table ── */}
      {!loading && users.length === 0 ? (
        <div style={{ background: "#fff", border: "1.5px solid #e7f3e8", borderRadius: 16,
          padding: "60px 24px", textAlign: "center" }}>
          <Users size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15, color: "#6b7280", fontWeight: 500 }}>No users found</p>
          <p style={{ margin: "4px 0 12px", fontSize: 13, color: "#9ca3af" }}>Try adjusting your filters</p>
          {hasActiveFilter && (
            <button onClick={clearFilters} style={{ padding: "8px 18px", borderRadius: 9,
              border: "1.5px solid #e5e7eb", background: "#fff", color: "#374151",
              fontSize: 13, cursor: "pointer" }}>Clear Filters</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1.5px solid #e7f3e8", borderRadius: 16,
            overflow: "hidden", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#f0fdf4" }}>
                    {["User", "Contact", "Role", "Address", "Status", "Actions"].map(h => (
                      <th key={h} style={{
                        padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left",
                        fontSize: 11, fontWeight: 700, color: "#374151",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        borderBottom: "1.5px solid #e7f3e8", whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user._id}
                      style={{
                        borderBottom: idx < users.length - 1 ? "1px solid #f3f4f6" : "none",
                        background: user.isBlocked ? "#fff5f5" : "#fff",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = user.isBlocked ? "#fee2e2" : "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = user.isBlocked ? "#fff5f5" : "#fff"}
                    >
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar user={user} />
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{user.name || "—"}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{user.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151" }}>
                          <Phone size={13} color="#9ca3af" />{user.phone || "—"}
                        </div>
                        <div style={{ fontSize: 11, marginTop: 3, fontWeight: 500,
                          color: user.isPhoneVerified ? "#16a34a" : "#9ca3af" }}>
                          {user.isPhoneVerified ? "✓ Verified" : "Not verified"}
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <Badge
                          bg={ROLE_COLORS[user.role]?.bg || "#f3f4f6"}
                          text={ROLE_COLORS[user.role]?.text || "#374151"}
                          border={ROLE_COLORS[user.role]?.border || "#e5e7eb"}
                        >
                          {user.role === "craneMan" ? "Crane Man" : user.role || "—"}
                        </Badge>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5,
                          fontSize: 13, color: "#6b7280", maxWidth: 160 }}>
                          <MapPin size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.address || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <Badge
                          bg={user.isBlocked ? "#fee2e2" : "#dcfce7"}
                          text={user.isBlocked ? "#991b1b" : "#166534"}
                          border={user.isBlocked ? "#fecaca" : "#bbf7d0"}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
                          <Link to={`/view-user/${user._id}`}>
                            <button title="View user" style={{
                              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                              background: "#f0fdf4", color: "#166534",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
                              onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}
                            ><Eye size={15} /></button>
                          </Link>
                          <button onClick={() => confirmBlockUnblock(user)}
                            title={user.isBlocked ? "Unblock" : "Block"}
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                              background: user.isBlocked ? "#d1fae5" : "#fff7ed",
                              color:      user.isBlocked ? "#065f46" : "#c2410c",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                          >
                            {user.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                          </button>
                          <button onClick={() => confirmDelete(user)} title="Delete"
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                              background: "#fff1f2", color: "#be123c",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#ffe4e6"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
                          ><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ── */}
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Showing{" "}
              <strong style={{ color: "#111827" }}>{(page - 1) * limit + 1}</strong>
              {" – "}
              <strong style={{ color: "#111827" }}>{Math.min(page * limit, total)}</strong>
              {" of "}
              <strong style={{ color: "#111827" }}>{total}</strong> users
            </p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => setPage(1)} disabled={page === 1}
                style={{ padding: "7px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9,
                  fontSize: 12, background: "#fff", cursor: "pointer",
                  color: page === 1 ? "#d1d5db" : "#374151",
                  pointerEvents: page === 1 ? "none" : "auto" }}>«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", gap: 3,
                  padding: "7px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9,
                  fontSize: 13, background: "#fff", cursor: "pointer",
                  color: page === 1 ? "#d1d5db" : "#374151",
                  pointerEvents: page === 1 ? "none" : "auto" }}>
                <ChevronLeft size={14} /> Prev
              </button>
              {pageNums.map(pg => (
                <button key={pg} onClick={() => setPage(pg)} style={{
                  width: 34, height: 34, borderRadius: 9, border: "1.5px solid",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  borderColor: page === pg ? "#166534" : "#e5e7eb",
                  background:  page === pg ? "#0f2412"  : "#fff",
                  color:       page === pg ? "#fff"     : "#374151",
                }}>{pg}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", gap: 3,
                  padding: "7px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9,
                  fontSize: 13, background: "#fff", cursor: "pointer",
                  color: page === totalPages ? "#d1d5db" : "#374151",
                  pointerEvents: page === totalPages ? "none" : "auto" }}>
                Next <ChevronRight size={14} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                style={{ padding: "7px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9,
                  fontSize: 12, background: "#fff", cursor: "pointer",
                  color: page === totalPages ? "#d1d5db" : "#374151",
                  pointerEvents: page === totalPages ? "none" : "auto" }}>»</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}