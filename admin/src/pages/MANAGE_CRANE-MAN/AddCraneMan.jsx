import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  ArrowLeft, Wrench, User, Phone, Mail, MapPin,
  Loader2, CheckCircle2, Recycle,
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "11px 14px 11px 40px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  color: "#111827",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  fontFamily: "'DM Sans','Segoe UI',sans-serif",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginBottom: 6,
};

const IconWrap = ({ children }) => (
  <div style={{
    position: "absolute", left: 12, top: "50%",
    transform: "translateY(-50%)", pointerEvents: "none",
  }}>
    {children}
  </div>
);

export default function AddCraneMan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())   e.phone   = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g,""))) e.phone = "Enter valid 10-digit phone";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setLoading(true);
      await api.post("/admin/create-crane-man", {
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim(),
      });
      setSuccess(true);
      toast.success("Crane man created successfully!");
      setTimeout(() => navigate("/crane-men"), 1600);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create crane man");
    } finally {
      setLoading(false);
    }
  };

  /* ── Fields config ── */
  const fields = [
    {
      name: "name", label: "Full Name", type: "text",
      placeholder: "e.g. Ramesh Kumar",
      icon: <User size={14} color="#9ca3af" />,
    },
    {
      name: "email", label: "Email Address", type: "email",
      placeholder: "e.g. ramesh@bharatscrap.com",
      icon: <Mail size={14} color="#9ca3af" />,
    },
    {
      name: "phone", label: "Phone Number", type: "tel",
      placeholder: "e.g. 9876543210",
      icon: <Phone size={14} color="#9ca3af" />,
    },
    {
      name: "address", label: "Address", type: "text",
      placeholder: "e.g. Rohini, New Delhi",
      icon: <MapPin size={14} color="#9ca3af" />,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fffe",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>

      {/* ── Sticky Top Bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#fff", borderBottom: "1.5px solid #e7f3e8",
        padding: "0 28px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/crane-men")} style={{
            width: 32, height: 32, borderRadius: 8,
            border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            <ArrowLeft size={15} color="#374151" />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
            <span onClick={() => navigate("/crane-men")}
              style={{ cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#111827"}
              onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
            >Crane Men</span>
            <span>/</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>Add New</span>
          </div>
        </div>

        {/* Top action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => navigate("/crane-men")} style={{
            padding: "7px 16px", borderRadius: 9,
            border: "1.5px solid #e5e7eb", background: "#fff",
            color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            style={{
              padding: "7px 20px", borderRadius: 9, border: "none",
              background: success ? "#16a34a" : loading ? "#6b7280" : "#0f2412",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.2s",
            }}
          >
            {success
              ? <><CheckCircle2 size={14} /> Created!</>
              : loading
              ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Creating…</>
              : <><Wrench size={14} /> Create Crane Man</>
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Body ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, background: "#0f2412", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Wrench size={19} color="#22c55e" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Recycle size={13} color="#9ca3af" />
              <span style={{ fontSize: 12, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                Bharat Scrap
              </span>
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
            Add New Crane Man
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: "#6b7280" }}>
            Fill in the details below to register a new crane man.
          </p>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "#fff", border: "1.5px solid #e7f3e8",
            borderRadius: 16, overflow: "hidden",
          }}>

            {/* Card Header */}
            <div style={{
              padding: "14px 20px", borderBottom: "1.5px solid #f0fdf4",
              background: "#f8fffe", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: "#dcfce7",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={13} color="#166534" />
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Crane Man Details
              </p>
              <span style={{
                marginLeft: "auto", fontSize: 11, color: "#9ca3af",
                background: "#f3f4f6", borderRadius: 99, padding: "2px 10px",
              }}>
                Role: craneMan (auto-assigned)
              </span>
            </div>

            {/* Fields */}
            <div style={{ padding: "24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 20px" }}>
              {fields.map(field => (
                <div key={field.name} style={{ gridColumn: field.name === "address" ? "1 / -1" : undefined }}>
                  <label style={labelStyle}>{field.label}</label>
                  <div style={{ position: "relative" }}>
                    <IconWrap>{field.icon}</IconWrap>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      style={{
                        ...inputStyle,
                        borderColor: errors[field.name] ? "#fca5a5" : "#e5e7eb",
                        background: errors[field.name] ? "#fff5f5" : "#fff",
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = errors[field.name] ? "#ef4444" : "#16a34a";
                        e.target.style.boxShadow = errors[field.name]
                          ? "0 0 0 3px rgba(239,68,68,0.08)"
                          : "0 0 0 3px rgba(22,163,74,0.08)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = errors[field.name] ? "#fca5a5" : "#e5e7eb";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  {errors[field.name] && (
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 500 }}>
                      ⚠ {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Info note */}
            <div style={{
              margin: "0 24px 20px",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: "10px 14px",
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <div style={{ marginTop: 1, flexShrink: 0 }}>
                <CheckCircle2 size={14} color="#16a34a" />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
                The crane man's role will automatically be set to <strong>craneMan</strong>.
                
              </p>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => navigate("/crane-men")} style={{
              padding: "10px 22px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", background: "#fff",
              color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || success} style={{
              padding: "10px 26px", borderRadius: 10, border: "none",
              background: success ? "#16a34a" : "#0f2412",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 16px rgba(15,36,18,0.18)",
              transition: "background 0.2s, opacity 0.2s",
              opacity: loading ? 0.75 : 1,
            }}>
              {success
                ? <><CheckCircle2 size={15} /> Created Successfully!</>
                : loading
                ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Creating…</>
                : <><Wrench size={15} /> Create Crane Man</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}