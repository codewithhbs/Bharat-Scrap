import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Search,
  Eye,
  Trash2,
  SlidersHorizontal,
  X,
  Car,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Wrench,
  IndianRupee,
  Gauge,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  processing: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  en_route: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  inspecting: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  en_route_to_garage: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  at_garage: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
  picked_up: { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  completed: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  sold: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
};

const ALL_STATUSES = [
  "pending",
  "processing",
  "en_route",
  "inspecting",
  "en_route_to_garage",
  "at_garage",
  "picked_up",
  "completed",
  "sold",
];

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  en_route: "En Route",
  inspecting: "Inspecting",
  en_route_to_garage: "En Route to Garage",
  at_garage: "At Garage",
  picked_up: "Picked Up",
  completed: "Completed",
  sold: "Sold",
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

const CarAvatar = ({ car }) => {
  const img = car?.frontImage?.image || car?.images?.[0]?.image;
  const initials = (car?.carDetail?.make || "C").charAt(0).toUpperCase();
  return img ? (
    <img
      src={img}
      alt={car?.carDetail?.make}
      style={{
        width: 44,
        height: 38,
        borderRadius: 8,
        objectFit: "cover",
        flexShrink: 0,
        border: "1.5px solid #e7f3e8",
      }}
    />
  ) : (
    <div
      style={{
        width: 44,
        height: 38,
        borderRadius: 8,
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 700,
        color: "#1e40af",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

export default function AllCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    limit: 10,
    page: 1,
    status: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search || undefined,
        limit: filters.limit,
        page: filters.page,
        status: filters.status || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        sortBy: filters.sortBy,
        order: filters.order,
      };
      const res = await api.get("/admin/cars", { params });
      if (res.data.success) {
        setCars(res.data.data || []);
        const pg = res.data.pagination || {};
        setTotalPages(pg.totalPages || 1);
        setTotalCars(pg.total || 0);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
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
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  const activeFiltersCount = [
    filters.status,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  // ── Change Status ──────────────────────────────────────────────
  const confirmStatusChange = (car) => {
    Swal.fire({
      title: "Change Job Status",
      html: `
        <p style="color:#6b7280;font-size:14px;margin-bottom:12px">
          Select a new status for <strong>${car.carDetail?.make} ${car.carDetail?.model}</strong> (${car.rcNumber})
        </p>
        <select id="swal-status" class="swal2-input" style="width:100%;margin:0">
          ${ALL_STATUSES.map(
            (s) =>
              `<option value="${s}" ${car.status === s ? "selected" : ""}>${STATUS_LABELS[s]}</option>`,
          ).join("")}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: "#166534",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update Status",
      preConfirm: () => {
        const val = document.getElementById("swal-status").value;
        if (!val) Swal.showValidationMessage("Please select a status");
        return val;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/cars/${car._id}/status`, {
            status: result.value,
          });
          Swal.fire({
            icon: "success",
            title: "Status Updated",
            text: `Status changed to "${result.value}".`,
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCars();
        } catch {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not update status.",
          });
        }
      }
    });
  };

  // ── Delete ─────────────────────────────────────────────────────
  const confirmDelete = (car) => {
    Swal.fire({
      title: "Delete this car listing?",
      text: `This will permanently delete ${car.carDetail?.make} ${car.carDetail?.model} (${car.rcNumber}). Cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/cars/${car._id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Car listing has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCars();
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete car.",
          });
        }
      }
    });
  };

  // ── Stats ──────────────────────────────────────────────────────
  const soldCount = cars.filter((c) => c.status === "sold").length;
  const pendingCount = cars.filter((c) => c.status === "pending").length;

  const fmt = (n) => (n ? `₹${Number(n).toLocaleString("en-IN")}` : "—");

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
          Car Listings
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
            label: "Total Listings",
            value: totalCars,
            icon: Car,
            color: "#1e40af",
            bg: "#dbeafe",
          },
          {
            label: "Sold",
            value: soldCount,
            icon: CheckCircle,
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: Clock,
            color: "#92400e",
            bg: "#fef3c7",
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
            maxWidth: 360,
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
            placeholder="Search by RC number or location..."
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

        {/* Sort */}
        <select
          name="order"
          value={filters.order}
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
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
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
            {/* Status */}
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
                Status
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
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {/* Min Price */}
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
                Min Price (₹)
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="e.g. 100000"
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
            {/* Max Price */}
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
                Max Price (₹)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="e.g. 500000"
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
              border: "3px solid #dbeafe",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            Loading car listings...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : cars.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #e7f3e8",
            borderRadius: 16,
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <Car size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            No car listings found
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
                      "Car",
                      "RC Number",
                      "Seller",
                      "Crane Man",
                      "Location",
                      "User Price (₹)",
                      "KM / Fuel",
                      "Status",
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
                  {cars.map((car, idx) => (
                    <tr
                      key={car._id}
                      style={{
                        borderBottom:
                          idx < cars.length - 1 ? "1px solid #f3f4f6" : "none",
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
                      {/* Car */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <CarAvatar car={car} />
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {car.carDetail?.make || "—"}{" "}
                              {car.carDetail?.model || ""}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#6b7280",
                              }}
                            >
                              {car.carDetail?.manufacturingYear || "—"} ·{" "}
                              {car.carDetail?.color || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* RC Number */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1e40af",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {car.rcNumber || "—"}
                        </span>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {car.carDetail?.vehicleClass || "—"}
                        </p>
                      </td>

                      {/* Seller */}
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
                          {car.seller?.name || "—"}
                        </div>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {car.seller?.phone || ""}
                        </p>
                      </td>

                      {/* Crane Man */}
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
                          <Wrench size={13} color="#9ca3af" />
                          {car.craneMan?.name || "—"}
                        </div>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {car.craneMan?.phone || ""}
                        </p>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 13,
                            color: "#6b7280",
                            maxWidth: 140,
                          }}
                        >
                          <MapPin
                            size={13}
                            color="#9ca3af"
                            style={{ flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {`${car.pickupLocation?.streetAndHouse || "—"}, ${car.pickupLocation?.address || "—"}`}
                          </span>
                        </div>
                      </td>

                      {/* User Price */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          <IndianRupee size={13} color="#6b7280" />
                          {car.priceUserWant
                            ? Number(car.priceUserWant).toLocaleString("en-IN")
                            : "—"}
                        </div>
                        {/* <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: car.isPaid ? "#16a34a" : "#9ca3af",
                            fontWeight: 500,
                          }}
                        >
                          {car.isPaid ? "✓ Paid" : "Unpaid"} ·{" "}
                          {car.paymentMethod?.toUpperCase() || "—"}
                        </p> */}
                      </td>

                      {/* KM / Fuel */}
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
                          <Gauge size={13} color="#9ca3af" />
                          {car.kmDriven
                            ? `${Number(car.kmDriven).toLocaleString("en-IN")} km`
                            : "—"}
                        </div>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#9ca3af",
                          }}
                        >
                          {car.carDetail?.fuelType || "—"}
                        </p>
                      </td>

                      {/* Status */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <Badge
                          bg={STATUS_COLORS[car.status]?.bg || "#f3f4f6"}
                          text={STATUS_COLORS[car.status]?.text || "#374151"}
                          border={
                            STATUS_COLORS[car.status]?.border || "#e5e7eb"
                          }
                        >
                          {STATUS_LABELS[car.status] || car.status || "—"}
                        </Badge>
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
                          <Link to={`/view-car/${car._id}`}>
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
                              title="View car"
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

                          {/* Change Status */}
                          <button
                            onClick={() => confirmStatusChange(car)}
                            title="Change status"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "none",
                              cursor: "pointer",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#dbeafe")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#eff6ff")
                            }
                          >
                            <RefreshCw size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => confirmDelete(car)}
                            title="Delete listing"
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
                  ))}
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
                {Math.min(filters.page * filters.limit, totalCars)}
              </strong>
              {" of "}
              <strong style={{ color: "#111827" }}>{totalCars}</strong> listings
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
