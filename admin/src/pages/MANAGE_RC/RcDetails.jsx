import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft,
  User,
  Car,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Hash,
  Calendar,
  MapPin,
  Fuel,
  Weight,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";

// ── Reusable Components ──────────────────────────────────────────

const STATUS_COLORS = {
  Active: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  Inactive: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  Pending: { bg: "#fef9c3", text: "#854d0e", border: "#fde68a" },
};

const Badge = ({ children, bg, text, border }) => (
  <span
    style={{
      background: bg,
      color: text,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
    }}
  >
    {children}
  </span>
);

const Section = ({ title, icon: Icon, children, accent = "#166534" }) => (
  <div
    style={{
      background: "#fff",
      border: "1.5px solid #e7f3e8",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
    }}
  >
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1.5px solid #f0fdf4",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#f8fffe",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={15} color={accent} />
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h2>
    </div>
    <div style={{ padding: "18px 20px" }}>{children}</div>
  </div>
);

const Field = ({ label, value, full = false, mono = false }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <p
      style={{
        margin: 0,
        fontSize: 10,
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 4,
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 14,
        color: "#111827",
        fontWeight: 500,
        fontFamily: mono ? "monospace" : "inherit",
      }}
    >
      {value || "—"}
    </p>
  </div>
);

const Grid = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: "18px 24px",
    }}
  >
    {children}
  </div>
);

const ValidityCard = ({ label, date, status }) => {
  const colors = {
    valid: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      badge: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
      label: "Valid",
    },
    expiring: {
      bg: "#fffbeb",
      border: "#fde68a",
      badge: { bg: "#fef9c3", text: "#92400e", border: "#fde68a" },
      label: "Expiring Soon",
    },
    expired: {
      bg: "#fff1f2",
      border: "#fecaca",
      badge: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
      label: "Expired",
    },
  };
  const c = colors[status] || colors.valid;
  return (
    <div
      style={{
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 10,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {date || "—"}
      </p>
      <Badge bg={c.badge.bg} text={c.badge.text} border={c.badge.border}>
        {c.badge.label}
      </Badge>
    </div>
  );
};

// ── Validity helper ──────────────────────────────────────────────
const getValidityStatus = (dateStr) => {
  if (!dateStr) return "expired";
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "expired";
  if (diff < 90) return "expiring";
  return "valid";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Main Component ───────────────────────────────────────────────
export default function RcDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rc, setRc] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRc = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/rc-details/${id}`);
      if (res.data.success) setRc(res.data.data);
    } catch (err) {
      console.error("Error fetching RC:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRc();
  }, [id]);

  // ── Delete ──────────────────────────────────────────────────────
  const confirmDelete = () => {
    const car = rc?.carDetail || {};
    Swal.fire({
      title: "Delete this RC record?",
      text: `${car.rcNumber} (${car.ownerName}) will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/rc-details/${id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            timer: 1800,
            showConfirmButton: false,
          });
          navigate(-1);
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete.",
          });
        }
      }
    });
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          flexDirection: "column",
          gap: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid #dcfce7",
            borderTop: "3px solid #16a34a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading RC details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!rc)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Car size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
        <p style={{ color: "#6b7280", fontSize: 15 }}>RC record not found.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 12,
            padding: "8px 20px",
            background: "#0f2412",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Go Back
        </button>
      </div>
    );

  const car = rc.carDetail || {};
  const statusColor = STATUS_COLORS[car.status] || STATUS_COLORS.Active;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Top Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={16} color="#374151" />
          </button>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              {car.rcNumber || "RC Details"}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
              {car.make} {car.model} · {car.manufacturingYear} · {car.color}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {/* <button
            onClick={() => navigate(`/edit-rc/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Edit size={14} /> Edit
          </button> */}
          <button
            onClick={fetchRc}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#f9fafb",
              color: "#374151",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {/* <button
            onClick={confirmDelete}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff1f2", color: "#be123c", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Trash2 size={14} /> Delete
          </button> */}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          {/* Status Strip */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e7f3e8",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Status
              </span>
              <Badge
                bg={statusColor.bg}
                text={statusColor.text}
                border={statusColor.border}
              >
                {car.status || "Active"}
              </Badge>
            </div>
            <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Category
              </span>
              <Badge bg="#ede9fe" text="#5b21b6" border="#ddd6fe">
                {car.vehicleCategory || "—"}
              </Badge>
            </div>
            <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Class
              </span>
              <Badge bg="#fef9c3" text="#92400e" border="#fde68a">
                {car.vehicleClass || "—"}
              </Badge>
            </div>
          </div>

          {/* Owner Info */}
          <Section title="Owner Information" icon={User}>
            <Grid>
              <Field label="Owner Name" value={car.ownerName} />
              <Field label="Father's Name" value={car.fatherName} />
              <Field label="Address" value={car.address} full />
            </Grid>
          </Section>

          {/* Vehicle Details */}
          <Section title="Vehicle Details" icon={Car}>
            <Grid>
              <Field label="Make" value={car.make} />
              <Field label="Model" value={car.model} />
              <Field label="Manufacturing Year" value={car.manufacturingYear} />
              <Field label="Color" value={car.color} />
              <Field label="Fuel Type" value={car.fuelType} />
              <Field label="Body Type" value={car.bodyType} />
              <Field label="Vehicle Class" value={car.vehicleClass} />
              <Field label="Vehicle Category" value={car.vehicleCategory} />
              <Field label="Seating Capacity" value={car.seatingCapacity} />
              <Field label="Standing Capacity" value={car.standingCapacity} />
              <Field
                label="Unladen Weight"
                value={car.unladenWeight ? `${car.unladenWeight} kg` : null}
              />
              <Field
                label="Gross Vehicle Weight"
                value={
                  car.grossVehicleWeight ? `${car.grossVehicleWeight} kg` : null
                }
              />
            </Grid>
          </Section>

          {/* Engine & Chassis */}
          <Section title="Identifiers" icon={Hash}>
            <Grid>
              <Field
                label="Chassis Number"
                value={car.chassisNumber}
                mono
                full
              />
              <Field label="Engine Number" value={car.engineNumber} mono />
            </Grid>
          </Section>

          {/* Validity */}
          <Section title="Validity & Registration" icon={Calendar}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 300px",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <ValidityCard
                label="Registration Validity"
                date={formatDate(car.registrationValidity)}
                status={getValidityStatus(car.registrationValidity)}
              />
              <ValidityCard
                label="Insurance Validity"
                date={formatDate(car.insuranceValidity)}
                status={getValidityStatus(car.insuranceValidity)}
              />
              <ValidityCard
                label="Pollution (PUC) Validity"
                date={formatDate(car.pollutionValidity)}
                status={getValidityStatus(car.pollutionValidity)}
              />
            </div>
            <Grid>
              <Field
                label="Registration Date"
                value={formatDate(car.registrationDate)}
              />
              <Field label="RTO Office" value={car.rtoOffice} />
            </Grid>
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* Vehicle Card */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e7f3e8",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Car size={32} color="#166534" />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {car.rcNumber || "—"}
            </p>
            <p style={{ margin: "2px 0 6px", fontSize: 12, color: "#9ca3af" }}>
              {car.make} {car.model}
            </p>
            <Badge
              bg={statusColor.bg}
              text={statusColor.text}
              border={statusColor.border}
            >
              {car.status || "Active"}
            </Badge>
          </div>

          {/* Quick Info */}
          <Section title="Quick Info" icon={FileText}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <Fuel size={13} color="#9ca3af" /> {car.fuelType || "—"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <Car size={13} color="#9ca3af" /> {car.bodyType} ·{" "}
                {car.vehicleClass}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <MapPin
                  size={13}
                  color="#9ca3af"
                  style={{ marginTop: 2, flexShrink: 0 }}
                />{" "}
                {car.rtoOffice || "—"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                <Weight size={13} color="#9ca3af" /> GVW:{" "}
                {car.grossVehicleWeight ? `${car.grossVehicleWeight} kg` : "—"}
              </div>
            </div>
          </Section>

          {/* Timestamps */}
          <div
            style={{
              background: "#f8fffe",
              border: "1.5px solid #e7f3e8",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>Created</span>
              <span style={{ color: "#374151", fontWeight: 600 }}>
                {rc.createdAt ? formatDate(rc.createdAt) : "—"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                Last Updated
              </span>
              <span style={{ color: "#374151", fontWeight: 600 }}>
                {rc.updatedAt ? formatDate(rc.updatedAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
