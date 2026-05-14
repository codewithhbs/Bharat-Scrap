import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Search,
  Eye,
  Trash2,
  SlidersHorizontal,
  X,
  FileText,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Car,
  Fuel,
  Hash,
  User,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const RC_STATUS_COLORS = {
  Active: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  Inactive: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  Pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Expired: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" },
};

const FUEL_COLORS = {
  Petrol: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  Diesel: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  Electric: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  CNG: { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
  Hybrid: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
};

const Badge = ({ children, bg, text, border }) => (
  <span
    style={{
      background: bg,
      color: text,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "capitalize",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

export default function AllRc() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    limit: 10,
    page: 1,
    status: "",
    fuelType: "",
    vehicleClass: "",
    startDate: "",
    endDate: "",
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search || undefined,
        limit: filters.limit,
        page: filters.page,
        status: filters.status || undefined,
        fuelType: filters.fuelType || undefined,
        vehicleClass: filters.vehicleClass || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      const res = await api.get("/admin/rc-details", { params });
      if (res.data.success) {
        setRecords(res.data.data || []);
        const pg = res.data.pagination || {};
        setTotalPages(pg.totalPages || 1);
        setTotalRecords(pg.total || 0);
      }
    } catch (error) {
      console.error("Error fetching RC details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages)
      setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      limit: 10,
      page: 1,
      status: "",
      fuelType: "",
      vehicleClass: "",
      startDate: "",
      endDate: "",
    });
  };

  const activeFiltersCount = [
    filters.status,
    filters.fuelType,
    filters.vehicleClass,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  // ── Delete ──────────────────────────────────────────────────────
  const confirmDelete = (rc) => {
    Swal.fire({
      title: "Delete RC Detail?",
      text: `This will permanently delete RC ${rc.carDetail?.rcNumber || rc._id}. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/rc-details/${rc._id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "RC detail has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchRecords();
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete RC detail.",
          });
        }
      }
    });
  };

  // ── Stats ───────────────────────────────────────────────────────
  const activeCount = records.filter(
    (r) => r.carDetail?.status === "Active",
  ).length;
  const expiredCount = records.filter(
    (r) => r.carDetail?.status !== "Active",
  ).length;

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
          RC Details
        </h1>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
          maxWidth: 560,
        }}
      >
        {[
          {
            label: "Total Records",
            value: totalRecords,
            icon: FileText,
            color: "#1e40af",
            bg: "#dbeafe",
          },
          {
            label: "Active",
            value: activeCount,
            icon: CheckCircle,
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Inactive",
            value: expiredCount,
            icon: XCircle,
            color: "#991b1b",
            bg: "#fee2e2",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #e7f3e8",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 11,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 240,
            maxWidth: 380,
          }}
        >
          <Search
            size={16}
            color="#9ca3af"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by RC no., owner, model, engine no..."
            style={{
              width: "100%",
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              background: "#fff",
              color: "#111827",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            border: "1.5px solid",
            background:
              showFilters || activeFiltersCount > 0 ? "#0f2412" : "#fff",
            borderColor:
              showFilters || activeFiltersCount > 0 ? "#0f2412" : "#e5e7eb",
            color: showFilters || activeFiltersCount > 0 ? "#fff" : "#374151",
            transition: "all 0.15s",
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: "#22c55e",
                color: "#0f2412",
                borderRadius: 999,
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Rows per page */}
        <select
          name="limit"
          value={filters.limit}
          onChange={handleFilterChange}
          style={{
            padding: "10px 12px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 10,
            fontSize: 14,
            color: "#374151",
            background: "#fff",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              Show {n}
            </option>
          ))}
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e7f3e8",
            borderRadius: 14,
            padding: "20px 22px",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            {/* RC Status */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                RC Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  color: "#374151",
                }}
              >
                <option value="">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Fuel Type
              </label>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  color: "#374151",
                }}
              >
                <option value="">All</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Vehicle Class */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                Vehicle Class
              </label>
              <select
                name="vehicleClass"
                value={filters.vehicleClass}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  color: "#374151",
                }}
              >
                <option value="">All</option>
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
                <option value="MCWG">MCWG</option>
                <option value="Transport">Transport</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  color: "#374151",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 14,
                  background: "#fff",
                  outline: "none",
                  color: "#374151",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <button
              onClick={clearFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={14} /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            flexDirection: "column",
            gap: 14,
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
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            Loading RC details...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : records.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e7f3e8",
            borderRadius: 16,
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <FileText size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            No RC details found
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e7f3e8",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr style={{ background: "#f0fdf4" }}>
                    {[
                      "RC Number",
                      "Vehicle",
                      "Owner",
                      "Fuel / Class",
                      "Validity",
                      "Insurance",
                      "RC Status",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: h === "Actions" ? "right" : "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#374151",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          borderBottom: "1.5px solid #e7f3e8",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rc, idx) => {
                    const cd = rc.carDetail || {};
                    const regExpiry = cd.registrationValidity
                      ? new Date(cd.registrationValidity)
                      : null;
                    const insExpiry = cd.insuranceValidity
                      ? new Date(cd.insuranceValidity)
                      : null;
                    const now = new Date();
                    const regExpired = regExpiry && regExpiry < now;
                    const insExpired = insExpiry && insExpiry < now;

                    return (
                      <tr
                        key={rc._id}
                        style={{
                          borderBottom:
                            idx < records.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                          background: "#fff",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0fdf4")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fff")
                        }
                      >
                        {/* RC Number */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                background: "#dbeafe",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Hash size={15} color="#1e40af" />
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#1e40af",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {cd.rcNumber || "—"}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  fontSize: 11,
                                  color: "#9ca3af",
                                }}
                              >
                                {cd.rtoOffice || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {cd.make || "—"} {cd.model || ""}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            {cd.manufacturingYear || "—"} · {cd.color || "—"}
                          </p>
                        </td>

                        {/* Owner */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 13,
                              color: "#374151",
                            }}
                          >
                            <User size={13} color="#9ca3af" />
                            {cd.ownerName || "—"}
                          </div>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 11,
                              color: "#9ca3af",
                            }}
                          >
                            {cd.fatherName ? `S/o ${cd.fatherName}` : ""}
                          </p>
                        </td>

                        {/* Fuel / Class */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <Badge
                              bg={FUEL_COLORS[cd.fuelType]?.bg || "#f3f4f6"}
                              text={FUEL_COLORS[cd.fuelType]?.text || "#374151"}
                              border={
                                FUEL_COLORS[cd.fuelType]?.border || "#e5e7eb"
                              }
                            >
                              {cd.fuelType || "—"}
                            </Badge>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                fontWeight: 500,
                              }}
                            >
                              {cd.vehicleClass || "—"} · {cd.bodyType || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Registration Validity */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 13,
                              color: regExpired ? "#dc2626" : "#374151",
                            }}
                          >
                            <Calendar
                              size={13}
                              color={regExpired ? "#dc2626" : "#9ca3af"}
                            />
                            {cd.registrationValidity || "—"}
                          </div>
                          {regExpired && (
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#dc2626",
                                fontWeight: 600,
                              }}
                            >
                              Expired
                            </p>
                          )}
                        </td>

                        {/* Insurance */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 13,
                              color: insExpired ? "#dc2626" : "#374151",
                            }}
                          >
                            <Calendar
                              size={13}
                              color={insExpired ? "#dc2626" : "#9ca3af"}
                            />
                            {cd.insuranceValidity || "—"}
                          </div>
                          {insExpired && (
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#dc2626",
                                fontWeight: 600,
                              }}
                            >
                              Expired
                            </p>
                          )}
                        </td>

                        {/* RC Status */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <Badge
                            bg={RC_STATUS_COLORS[cd.status]?.bg || "#f3f4f6"}
                            text={
                              RC_STATUS_COLORS[cd.status]?.text || "#374151"
                            }
                            border={
                              RC_STATUS_COLORS[cd.status]?.border || "#e5e7eb"
                            }
                          >
                            {cd.status || "—"}
                          </Badge>
                        </td>

                        {/* Created At */}
                        <td
                          style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              color: "#374151",
                            }}
                          >
                            {rc.createdAt
                              ? new Date(rc.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </p>
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "13px 16px",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            {/* View */}
                            <Link to={`/view-rc/${rc._id}`}>
                              <button
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  border: "none",
                                  cursor: "pointer",
                                  background: "#f0fdf4",
                                  color: "#166534",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="View RC detail"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#dcfce7")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "#f0fdf4")
                                }
                              >
                                <Eye size={15} />
                              </button>
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => confirmDelete(rc)}
                              title="Delete RC detail"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                background: "#fff1f2",
                                color: "#be123c",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#ffe4e6")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#fff1f2")
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Showing{" "}
              <strong style={{ color: "#111827" }}>
                {(filters.page - 1) * filters.limit + 1}
              </strong>
              {" – "}
              <strong style={{ color: "#111827" }}>
                {Math.min(filters.page * filters.limit, totalRecords)}
              </strong>
              {" of "}
              <strong style={{ color: "#111827" }}>{totalRecords}</strong>{" "}
              records
            </p>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  background: "#fff",
                  cursor: "pointer",
                  color: filters.page === 1 ? "#d1d5db" : "#374151",
                  pointerEvents: filters.page === 1 ? "none" : "auto",
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => handlePageChange(pg)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      border: "1.5px solid",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      borderColor: filters.page === pg ? "#166534" : "#e5e7eb",
                      background: filters.page === pg ? "#0f2412" : "#fff",
                      color: filters.page === pg ? "#fff" : "#374151",
                    }}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  background: "#fff",
                  cursor: "pointer",
                  color: filters.page === totalPages ? "#d1d5db" : "#374151",
                  pointerEvents: filters.page === totalPages ? "none" : "auto",
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
