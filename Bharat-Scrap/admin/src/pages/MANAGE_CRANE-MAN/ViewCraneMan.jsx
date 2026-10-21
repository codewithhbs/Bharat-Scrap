import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Ban,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";

// ── Reusable Components ──────────────────────────────────────────

const ROLE_COLORS = {
  user:     { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  admin:    { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  craneMan: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
};

const Badge = ({ children, bg, text, border }) => (
  <span style={{
    background: bg, color: text, border: `1px solid ${border}`,
    borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600,
    letterSpacing: "0.04em", textTransform: "capitalize",
  }}>
    {children}
  </span>
);

const Section = ({ title, icon: Icon, children, accent = "#166534" }) => (
  <div style={{
    background: "#fff", border: "1.5px solid #e7f3e8",
    borderRadius: 16, overflow: "hidden", marginBottom: 20,
  }}>
    <div style={{
      padding: "14px 20px", borderBottom: "1.5px solid #f0fdf4",
      display: "flex", alignItems: "center", gap: 10, background: "#f8fffe",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: "#dcfce7",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={15} color={accent} />
      </div>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>
        {title}
      </h2>
    </div>
    <div style={{ padding: "18px 20px" }}>{children}</div>
  </div>
);

const Field = ({ label, value, full = false }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
      {label}
    </p>
    <p style={{ margin: 0, fontSize: 14, color: "#111827", fontWeight: 500 }}>
      {value || "—"}
    </p>
  </div>
);

const Grid = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "18px 24px" }}>
    {children}
  </div>
);

const BoolField = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {value
      ? <CheckCircle size={15} color="#16a34a" />
      : <XCircle size={15} color="#dc2626" />}
    <span style={{ fontSize: 13, color: value ? "#166534" : "#991b1b", fontWeight: 500 }}>{label}</span>
  </div>
);

export default function ViewCraneMan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${id}`);
      if (res.data.success) setUser(res.data.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  // ── Block / Unblock ─────────────────────────────────────────────
  const confirmToggleBlock = () => {
    const isBlocked = user.isBlocked;
    Swal.fire({
      title: isBlocked ? "Unblock this user?" : "Block this user?",
      text: `${user.name} will be ${isBlocked ? "unblocked and regain access" : "blocked and lose access"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isBlocked ? "#166534" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isBlocked ? "Yes, unblock!" : "Yes, block!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/users/${id}`, { isBlocked: !isBlocked });
          Swal.fire({ icon: "success", title: isBlocked ? "Unblocked!" : "Blocked!", timer: 1800, showConfirmButton: false });
          fetchUser();
        } catch {
          Swal.fire({ icon: "error", title: "Failed", text: "Could not update user." });
        }
      }
    });
  };

  // ── Delete ──────────────────────────────────────────────────────
  const confirmDelete = () => {
    Swal.fire({
      title: "Delete this user?",
      text: `${user.name} (${user.email}) will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/users/${id}`);
          Swal.fire({ icon: "success", title: "Deleted!", timer: 1800, showConfirmButton: false });
          navigate(-1);
        } catch {
          Swal.fire({ icon: "error", title: "Error", text: "Failed to delete." });
        }
      }
    });
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, flexDirection: "column", gap: 14, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 44, height: 44, border: "3px solid #dcfce7", borderTop: "3px solid #16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading crane man details...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <User size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
      <p style={{ color: "#6b7280", fontSize: 15 }}>Crane man not found.</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: 12, padding: "8px 20px", background: "#0f2412", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>
        Go Back
      </button>
    </div>
  );

  const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.user;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={16} color="#374151" />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>
              {user.name || "Unnamed User"}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
              {user.email} · {user.phone || "No phone"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate(`/edit-crane-man/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={confirmToggleBlock}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${user.isBlocked ? "#bbf7d0" : "#fde68a"}`, background: user.isBlocked ? "#f0fdf4" : "#fffbeb", color: user.isBlocked ? "#166534" : "#92400e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Ban size={14} /> {user.isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={confirmDelete}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff1f2", color: "#be123c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* LEFT */}
        <div>

          {/* Status Strip */}
          <div style={{
            background: "#fff", border: "1.5px solid #e7f3e8", borderRadius: 16,
            padding: "16px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Role</span>
              <Badge bg={roleColor.bg} text={roleColor.text} border={roleColor.border}>
                {user.role}
              </Badge>
            </div>
            <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
            <BoolField label="Phone Verified" value={user.isPhoneVerified} />
            <BoolField label="Blocked"        value={user.isBlocked} />
          </div>

          {/* Basic Info */}
          <Section title="Basic Information" icon={User}>
            <Grid>
              <Field label="Full Name" value={user.name} />
              <Field label="Email"     value={user.email} />
              <Field label="Phone"     value={user.phone} />
              <Field label="Role"      value={user.role} />
              <Field label="Address"   value={user.address} full />
            </Grid>
          </Section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div>

          {/* Avatar Card */}
          <div style={{
            background: "#fff", border: "1.5px solid #e7f3e8", borderRadius: 16,
            padding: 20, marginBottom: 20, textAlign: "center",
          }}>
            {user.userImage?.img ? (
              <img
                src={user.userImage.img}
                alt={user.name}
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #dcfce7", marginBottom: 12 }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "#dcfce7",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "#166534",
                margin: "0 auto 12px",
              }}>
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{user.name || "—"}</p>
            <p style={{ margin: "2px 0 8px", fontSize: 12, color: "#9ca3af" }}>{user.role}</p>
            <Badge bg={roleColor.bg} text={roleColor.text} border={roleColor.border}>
              {user.isBlocked ? "Blocked" : "Active"}
            </Badge>
          </div>

          {/* Contact */}
          <Section title="Contact" icon={Phone}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                <Mail size={13} color="#9ca3af" /> {user.email || "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                <Phone size={13} color="#9ca3af" /> {user.phone || "—"}
              </div>
              {user.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
                  <MapPin size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} /> {user.address}
                </div>
              )}
            </div>
          </Section>

          {/* Timestamps */}
          <div style={{
            background: "#f8fffe", border: "1.5px solid #e7f3e8", borderRadius: 12,
            padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>Joined</span>
              <span style={{ color: "#374151", fontWeight: 600 }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>Last Updated</span>
              <span style={{ color: "#374151", fontWeight: 600 }}>
                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}