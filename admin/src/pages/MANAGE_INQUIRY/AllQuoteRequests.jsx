import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import {
  Search,
  Eye,
  Trash2,
  X,
  FileText,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Recycle,
  Car,
  MapPin,
  Fuel,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";

// Debounce hook for search
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AllQuoteRequests() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      };
      const res = await api.get("/admin/quote-requests", { params });
      if (res.data.success) {
        setQuotes(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching quote requests:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // ── Delete ────────────────────────────────────────────────────
  const confirmDelete = (q) => {
    Swal.fire({
      title: "Delete quote request?",
      text: `This will permanently delete the request from ${q.name || "this user"}. Cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/contact-messages/${q._id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchQuotes();
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete request.",
          });
        }
      }
    });
  };

  // ── View modal ────────────────────────────────────────────────
  const viewQuote = (q) => {
    Swal.fire({
      title: `Quote Request — ${q.name || "Unknown"}`,
      width: 500,
      html: `
        <div style="text-align:left; font-size:14px; color:#374151; line-height:1.8;">
          <p style="margin:0 0 4px"><strong>📧 Email:</strong> ${q.email || "—"}</p>
          <p style="margin:0 0 4px"><strong>📞 Phone:</strong> ${q.phone || "—"}</p>
          <p style="margin:0 0 4px"><strong>📍 City:</strong> ${q.city || "—"}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:10px 0"/>
          <p style="margin:0 0 4px"><strong>🚗 Brand:</strong> ${q.brand || "—"}</p>
          <p style="margin:0 0 4px"><strong>🏷️ Model:</strong> ${q.model || "—"}</p>
          <p style="margin:0 0 4px"><strong>📅 Year:</strong> ${q.year || "—"}</p>
          <p style="margin:0 0 4px"><strong>⛽ Fuel Type:</strong> ${q.fuelType || "—"}</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#166534",
      confirmButtonText: "Close",
    });
  };

  // Page numbers to show
  const pageNums = (() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#0f2412",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Recycle size={17} color="#22c55e" />
          </div>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Bharat Scrap · Admin
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.4px",
          }}
        >
          Quote Requests
        </h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
          View and manage all incoming vehicle quote requests
        </p>
      </div>

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
          maxWidth: 420,
        }}
      >
        {[
          {
            label: "Total Requests",
            value: total,
            icon: FileText,
            color: "#166534",
            bg: "#dcfce7",
          },
          {
            label: "Showing",
            value: quotes.length,
            icon: Eye,
            color: "#065f46",
            bg: "#d1fae5",
          },
          {
            label: "Pages",
            value: totalPages,
            icon: ChevronRight,
            color: "#374151",
            bg: "#f3f4f6",
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

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: 240,
            maxWidth: 420,
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, phone, brand, city..."
            style={{
              width: "100%",
              paddingLeft: 38,
              paddingRight: searchInput ? 36 : 14,
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
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
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

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#9ca3af",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid #e5e7eb",
                borderTop: "2px solid #16a34a",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Loading...
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Table ── */}
      {!loading && quotes.length === 0 ? (
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
            No quote requests found
          </p>
          <p style={{ margin: "4px 0 12px", fontSize: 13, color: "#9ca3af" }}>
            {searchInput
              ? "Try adjusting your search"
              : "No quote requests yet"}
          </p>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              style={{
                padding: "8px 18px",
                borderRadius: 9,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                color: "#374151",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e7f3e8",
              borderRadius: 16,
              overflow: "hidden",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
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
                      "Name",
                      "Contact",
                      "Vehicle",
                      "Year / Fuel",
                      "City",
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
                  {quotes.map((q, idx) => (
                    <tr
                      key={q._id}
                      style={{
                        borderBottom:
                          idx < quotes.length - 1
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
                      {/* Name */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              background: "#dcfce7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <User size={15} color="#166534" />
                          </div>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {q.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Contact: email + phone */}
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
                          <Mail size={13} color="#9ca3af" />
                          {q.email || "—"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 3,
                          }}
                        >
                          <Phone size={12} color="#9ca3af" />
                          {q.phone || "—"}
                        </div>
                      </td>

                      {/* Vehicle: brand + model */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Car size={14} color="#1d4ed8" />
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {q.brand || "—"}
                            </p>
                            <p
                              style={{
                                margin: "1px 0 0",
                                fontSize: 12,
                                color: "#6b7280",
                              }}
                            >
                              {q.model || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Year + Fuel Type */}
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
                          <Calendar size={13} color="#9ca3af" />
                          {q.year || "—"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 3,
                          }}
                        >
                          <Fuel size={12} color="#9ca3af" />
                          {q.fuelType || "—"}
                        </div>
                      </td>

                      {/* City */}
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
                          <MapPin size={13} color="#9ca3af" />
                          {q.city || "—"}
                        </div>
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
                          <button
                            onClick={() => viewQuote(q)}
                            title="View details"
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
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#dcfce7")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#f0fdf4")
                            }
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => confirmDelete(q)}
                            title="Delete"
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

          {/* ── Pagination ── */}
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
                {(page - 1) * limit + 1}
              </strong>
              {" – "}
              <strong style={{ color: "#111827" }}>
                {Math.min(page * limit, total)}
              </strong>
              {" of "}
              <strong style={{ color: "#111827" }}>{total}</strong> requests
            </p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                style={{
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#fff",
                  cursor: "pointer",
                  color: page === 1 ? "#d1d5db" : "#374151",
                  pointerEvents: page === 1 ? "none" : "auto",
                }}
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  background: "#fff",
                  cursor: "pointer",
                  color: page === 1 ? "#d1d5db" : "#374151",
                  pointerEvents: page === 1 ? "none" : "auto",
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {pageNums.map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    border: "1.5px solid",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    borderColor: page === pg ? "#166634" : "#e5e7eb",
                    background: page === pg ? "#0f2412" : "#fff",
                    color: page === pg ? "#fff" : "#374151",
                  }}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 13,
                  background: "#fff",
                  cursor: "pointer",
                  color: page === totalPages ? "#d1d5db" : "#374151",
                  pointerEvents: page === totalPages ? "none" : "auto",
                }}
              >
                Next <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={{
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9,
                  fontSize: 12,
                  background: "#fff",
                  cursor: "pointer",
                  color: page === totalPages ? "#d1d5db" : "#374151",
                  pointerEvents: page === totalPages ? "none" : "auto",
                }}
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
