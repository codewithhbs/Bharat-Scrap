import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Truck,
  Car,
  IndianRupee,
  Clock,
  CheckCircle2,
  Loader2,
  Package,
  TrendingUp,
  Recycle,
} from "lucide-react";
import api from "../utils/api";
import axios from "axios";

const COLORS = {
  green: {
    bg: "#166534",
    light: "#dcfce7",
    text: "#14532d",
    accent: "#22c55e",
  },
  emerald: {
    bg: "#065f46",
    light: "#d1fae5",
    text: "#064e3b",
    accent: "#10b981",
  },
  lime: { bg: "#3f6212", light: "#ecfccb", text: "#365314", accent: "#84cc16" },
  amber: {
    bg: "#92400e",
    light: "#fef3c7",
    text: "#78350f",
    accent: "#f59e0b",
  },
  red: { bg: "#7f1d1d", light: "#fee2e2", text: "#7f1d1d", accent: "#ef4444" },
  teal: { bg: "#134e4a", light: "#ccfbf1", text: "#134e4a", accent: "#14b8a6" },
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#10b981"];

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f2412",
          border: "1px solid #166534",
          borderRadius: 8,
          padding: "8px 14px",
          color: "#bbf7d0",
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>{label || payload[0].name}</p>
        <p style={{ margin: 0, color: "#4ade80" }}>
          {typeof payload[0].value === "number" &&
          payload[0].name?.toLowerCase().includes("revenue")
            ? formatCurrency(payload[0].value)
            : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, icon: Icon, color, prefix = "" }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e7f3e8",
      borderRadius: 16,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      transition: "box-shadow 0.2s",
      cursor: "default",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.boxShadow = "0 4px 24px #22c55e22")
    }
    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 32,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-1px",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {prefix}
          {value ?? 0}
        </p>
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: COLORS[color]?.light || "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={COLORS[color]?.bg || "#166534"} />
      </div>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "#22c55e",
        fontWeight: 500,
      }}
    >
      <TrendingUp size={12} />
      <span>Live data</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://www.api.bharatscrapfacilities.com/api/admin/dashboard-data")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 500,
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            border: "3px solid #dcfce7",
            borderTop: "3px solid #16a34a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 24px",
          color: "#ef4444",
          fontSize: 16,
        }}
      >
        Error: {error || "No data available"}
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Users",
      value: data.totalUser,
      icon: Users,
      color: "green",
    },
    {
      label: "Crane Men",
      value: data.totalCraneman,
      icon: Truck,
      color: "teal",
    },
    { label: "Total Cars", value: data.totalCars, icon: Car, color: "emerald" },
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue || 0),
      icon: IndianRupee,
      color: "lime",
      raw: true,
    },
  ];

  const statusCards = [
    {
      label: "Processing",
      value: data.totalProcessingCars,
      icon: Loader2,
      color: "amber",
    },
    {
      label: "Completed / Sold",
      value: data.totalCompletedCars,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Pending",
      value: data.totalPendingCars,
      icon: Clock,
      color: "red",
    },
  ];

  const barData = [
    { name: "Processing", value: data.totalProcessingCars, fill: "#f59e0b" },
    { name: "Sold", value: data.totalCompletedCars, fill: "#22c55e" },
    { name: "Pending", value: data.totalPendingCars, fill: "#ef4444" },
  ];

  const pieData = [
    { name: "Processing", value: data.totalProcessingCars },
    { name: "Pending", value: data.totalPendingCars },
    { name: "Sold", value: data.totalCompletedCars },
  ];

  const totalCarsForPct = data.totalCars || 1;

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f2412 0%, #14532d 60%, #166534 100%)",
          borderRadius: 20,
          padding: "36px 40px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            right: 120,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.05)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "#22c55e",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Recycle size={22} color="#0f2412" />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#86efac",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Bharat Scrap · Admin Panel
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 700,
              color: "#f0fdf4",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard Overview
          </h1>
          <p style={{ margin: "8px 0 0", color: "#86efac", fontSize: 15 }}>
            Monitor users, crane men, car inventory &amp; revenue in real time.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {kpiCards.map((card, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #e7f3e8",
              borderRadius: 16,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 24px #22c55e22")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: card.raw ? 24 : 34,
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-1px",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {card.value ?? 0}
                </p>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS[card.color]?.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <card.icon size={22} color={COLORS[card.color]?.bg} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#22c55e",
                fontWeight: 500,
              }}
            >
              <TrendingUp size={12} />
              <span>Live data</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statusCards.map((card, i) => (
          <div
            key={i}
            style={{
              background: COLORS[card.color]?.light,
              border: `1px solid ${COLORS[card.color]?.accent}33`,
              borderRadius: 14,
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <card.icon size={20} color={COLORS[card.color]?.bg} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS[card.color]?.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS[card.color]?.bg,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {card.value ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Bar Chart */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7f3e8",
            borderRadius: 16,
            padding: "24px 24px 16px",
          }}
        >
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Package size={16} color="#16a34a" />
            Car Inventory Status
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={42}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0fdf4"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f0fdf4" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e7f3e8",
            borderRadius: 16,
            padding: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Car size={16} color="#16a34a" />
            Car Status Distribution
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                dataKey="value"
                paddingAngle={4}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "#d1d5db" }}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e7f3e8",
          borderRadius: 16,
          padding: "28px 28px",
        }}
      >
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 15,
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          Inventory Breakdown
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            {
              label: "Processing",
              value: data.totalProcessingCars,
              color: "#f59e0b",
              bg: "#fef3c7",
            },
            {
              label: "Sold / Completed",
              value: data.totalCompletedCars,
              color: "#22c55e",
              bg: "#dcfce7",
            },
            {
              label: "Pending",
              value: data.totalPendingCars,
              color: "#ef4444",
              bg: "#fee2e2",
            },
          ].map((item, i) => {
            const pct = Math.round((item.value / totalCarsForPct) * 100);
            return (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {item.value} cars &nbsp;·&nbsp; {pct}%
                  </span>
                </div>
                <div
                  style={{
                    background: item.bg,
                    borderRadius: 999,
                    height: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: item.color,
                      borderRadius: 999,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 12,
          marginTop: 32,
        }}
      >
        © {new Date().getFullYear()} Bharat Scrap Admin Panel · All rights
        reserved
      </p>
    </div>
  );
}
