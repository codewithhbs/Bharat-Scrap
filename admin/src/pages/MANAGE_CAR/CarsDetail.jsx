import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
  ArrowLeft, Car, User, Wrench, MapPin, IndianRupee, CreditCard,
  RefreshCw, Trash2, Phone, Mail, FileText, Image, CheckCircle,
  XCircle, X, Search, UserCheck, Loader2, BadgeCheck, Shield,
} from "lucide-react";
import Swal from "sweetalert2";

/* ─── Responsive hook ────────────────────────────────────────────── */
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ─── Constants ─────────────────────────────────────────────────── */
const STATUS_COLORS = {
  pending:             { bg: "#fef3c7", text: "#92400e",  border: "#fde68a" },
  processing:          { bg: "#dbeafe", text: "#1e40af",  border: "#bfdbfe" },
  en_route:            { bg: "#ede9fe", text: "#5b21b6",  border: "#ddd6fe" },
  inspecting:          { bg: "#fff7ed", text: "#c2410c",  border: "#fed7aa" },
  en_route_to_garage:  { bg: "#f0fdf4", text: "#166534",  border: "#bbf7d0" },
  at_garage:           { bg: "#ecfdf5", text: "#065f46",  border: "#6ee7b7" },
  picked_up:           { bg: "#f0f9ff", text: "#0369a1",  border: "#bae6fd" },
  completed:           { bg: "#d1fae5", text: "#065f46",  border: "#6ee7b7" },
  sold:                { bg: "#dcfce7", text: "#166534",  border: "#bbf7d0" },
};
const ALL_STATUSES = ["pending","processing","en_route","inspecting","en_route_to_garage","at_garage","picked_up","completed","sold"];
const STATUS_LABELS = {
  pending:"Pending", processing:"Processing", en_route:"En Route",
  inspecting:"Inspecting", en_route_to_garage:"En Route to Garage",
  at_garage:"At Garage", picked_up:"Picked Up", completed:"Completed", sold:"Sold",
};

/* ─── Tiny helpers ───────────────────────────────────────────────── */
const Badge = ({ children, bg, text, border }) => (
  <span style={{ background:bg, color:text, border:`1px solid ${border}`,
    borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600,
    letterSpacing:"0.04em", textTransform:"capitalize" }}>
    {children}
  </span>
);

const Section = ({ title, icon: Icon, children }) => (
  <div style={{ background:"#fff", border:"1.5px solid #e7f3e8", borderRadius:16,
    overflow:"hidden", marginBottom:20 }}>
    <div style={{ padding:"14px 20px", borderBottom:"1.5px solid #f0fdf4",
      display:"flex", alignItems:"center", gap:10, background:"#f8fffe" }}>
      <div style={{ width:30, height:30, borderRadius:8, background:"#dcfce7",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={15} color="#166534" />
      </div>
      <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:"#0f172a", letterSpacing:"-0.2px" }}>
        {title}
      </h2>
    </div>
    <div style={{ padding:"18px 20px" }}>{children}</div>
  </div>
);

const Field = ({ label, value, full=false }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <p style={{ margin:0, fontSize:10, fontWeight:700, color:"#9ca3af",
      textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{label}</p>
    <p style={{ margin:0, fontSize:14, color:"#111827", fontWeight:500,
      wordBreak:"break-word" }}>{value ?? "—"}</p>
  </div>
);

const Grid = ({ children, cols=3 }) => (
  <div style={{ display:"grid",
    gridTemplateColumns:`repeat(auto-fill, minmax(${cols===2?200:160}px, 1fr))`,
    gap:"16px 20px" }}>
    {children}
  </div>
);

const BoolField = ({ label, value }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    {value ? <CheckCircle size={15} color="#16a34a"/> : <XCircle size={15} color="#dc2626"/>}
    <span style={{ fontSize:13, color: value?"#166534":"#991b1b", fontWeight:500 }}>{label}</span>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   ASSIGN CRANE MAN MODAL
═══════════════════════════════════════════════════════════════════ */
function AssignCraneManModal({ craneList, currentCraneManId, carId, onClose, onAssigned }) {
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(currentCraneManId || null);
  const [assigning, setAssigning] = useState(false);

  const filtered = craneList.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      await api.put(`/admin/assign-crane-man/${carId}`, { craneManId: selected });
      onAssigned();
      onClose();
      Swal.fire({ icon:"success", title:"Assigned!", text:"Crane man assigned successfully.",
        timer:2000, showConfirmButton:false });
    } catch {
      Swal.fire({ icon:"error", title:"Failed", text:"Could not assign crane man." });
    } finally { setAssigning(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
        backdropFilter:"blur(3px)", zIndex:1000,
      }} />

      <div style={{
        position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:"min(660px, 95vw)", maxHeight:"88vh",
        background:"#fff", borderRadius:20, zIndex:1001,
        display:"flex", flexDirection:"column",
        boxShadow:"0 24px 80px rgba(0,0,0,0.18)",
        overflow:"hidden",
        fontFamily:"'DM Sans','Segoe UI',sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding:"20px 20px 16px",
          borderBottom:"1.5px solid #f0fdf4",
          background:"linear-gradient(135deg,#0f2412 0%,#166534 100%)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"#22c55e",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Wrench size={17} color="#0f2412" />
                </div>
                <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"#f0fdf4" }}>
                  Assign Crane Man
                </h2>
              </div>
              <p style={{ margin:0, fontSize:12, color:"#86efac" }}>
                {craneList.length} available · Select one to assign
              </p>
            </div>
            <button onClick={onClose} style={{
              width:32, height:32, borderRadius:8, border:"1.5px solid #166534",
              background:"rgba(255,255,255,0.1)", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
              flexShrink:0, marginLeft:8,
            }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ position:"relative", marginTop:14 }}>
            <Search size={14} color="#9ca3af"
              style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, address…"
              style={{
                width:"100%", paddingLeft:34, paddingRight:14, paddingTop:10, paddingBottom:10,
                borderRadius:10, border:"1.5px solid #166534", fontSize:13,
                background:"rgba(255,255,255,0.08)", color:"#f0fdf4",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY:"auto", flex:1, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af" }}>
              <Wrench size={36} color="#e5e7eb" style={{ marginBottom:8 }} />
              <p style={{ margin:0, fontSize:14 }}>No crane men found</p>
            </div>
          ) : filtered.map(cm => {
            const isSelected = selected === cm._id;
            const isCurrent  = currentCraneManId === cm._id;
            return (
              <div key={cm._id}
                onClick={() => setSelected(cm._id)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 14px", borderRadius:14, cursor:"pointer",
                  border: isSelected ? "2px solid #16a34a" : "1.5px solid #e5e7eb",
                  background: isSelected ? "#f0fdf4" : "#fff",
                  transition:"all 0.15s",
                  position:"relative",
                }}
              >
                <div style={{ position:"relative", flexShrink:0 }}>
                  {cm.userImage?.img ? (
                    <img src={cm.userImage.img} alt={cm.name} style={{
                      width:46, height:46, borderRadius:12, objectFit:"cover",
                      border: isSelected ? "2.5px solid #16a34a" : "2px solid #e5e7eb",
                    }} />
                  ) : (
                    <div style={{
                      width:46, height:46, borderRadius:12,
                      background: isSelected ? "#dcfce7" : "#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, fontWeight:700,
                      color: isSelected ? "#166534" : "#9ca3af",
                      border: isSelected ? "2.5px solid #16a34a" : "2px solid #e5e7eb",
                    }}>
                      {(cm.name||"C").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{
                    position:"absolute", bottom:2, right:2,
                    width:10, height:10, borderRadius:"50%",
                    background: cm.isBlocked ? "#ef4444" : "#22c55e",
                    border:"2px solid #fff",
                  }} />
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#111827" }}>
                      {cm.name || "—"}
                    </p>
                    {isCurrent && (
                      <span style={{ background:"#fef9c3", color:"#854d0e", border:"1px solid #fde047",
                        borderRadius:99, padding:"1px 8px", fontSize:10, fontWeight:700 }}>
                        Current
                      </span>
                    )}
                    {cm.isPhoneVerified && <BadgeCheck size={13} color="#16a34a" />}
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#6b7280" }}>
                      <Phone size={10} color="#9ca3af" />{cm.phone || "—"}
                    </span>
                    {cm.address && (
                      <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#9ca3af",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        <MapPin size={10} color="#9ca3af" />{cm.address}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  width:20, height:20, borderRadius:"50%", flexShrink:0,
                  border: isSelected ? "none" : "2px solid #d1d5db",
                  background: isSelected ? "#16a34a" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {isSelected && <CheckCircle size={13} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding:"12px 16px", borderTop:"1.5px solid #f0fdf4",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"#f8fffe", gap:8, flexWrap:"wrap",
        }}>
          <p style={{ margin:0, fontSize:12, color:"#6b7280", flex:1, minWidth:0,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {selected
              ? `Selected: ${craneList.find(c=>c._id===selected)?.name || "—"}`
              : "No one selected"}
          </p>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={onClose} style={{
              padding:"8px 14px", borderRadius:10, border:"1.5px solid #e5e7eb",
              background:"#fff", color:"#374151", fontSize:13, fontWeight:500, cursor:"pointer",
            }}>
              Cancel
            </button>
            <button onClick={handleAssign} disabled={!selected || assigning} style={{
              padding:"8px 16px", borderRadius:10, border:"none",
              background: selected && !assigning ? "#0f2412" : "#d1d5db",
              color: selected && !assigning ? "#fff" : "#9ca3af",
              fontSize:13, fontWeight:600, cursor: selected ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", gap:6,
            }}>
              {assigning ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }} /> : <UserCheck size={13} />}
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN CAR DETAIL PAGE
═══════════════════════════════════════════════════════════════════ */
export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const [car, setCar]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, src: null, label: "", allImgs: [], idx: 0 });
  const [craneList, setCraneList] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const openLightbox = (src, label, allImgs, idx) =>
    setLightbox({ open: true, src, label, allImgs, idx });
  const closeLightbox = () => setLightbox(prev => ({ ...prev, open: false }));
  const lbPrev = () => setLightbox(prev => {
    const i = (prev.idx - 1 + prev.allImgs.length) % prev.allImgs.length;
    return { ...prev, idx: i, src: prev.allImgs[i].src, label: prev.allImgs[i].label };
  });
  const lbNext = () => setLightbox(prev => {
    const i = (prev.idx + 1) % prev.allImgs.length;
    return { ...prev, idx: i, src: prev.allImgs[i].src, label: prev.allImgs[i].label };
  });

  React.useEffect(() => {
    const handler = (e) => {
      if (!lightbox.open) return;
      if (e.key === "ArrowLeft")  lbPrev();
      if (e.key === "ArrowRight") lbNext();
      if (e.key === "Escape")     closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/cars/${id}`);
      if (res.data.success) setCar(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCraneList = async () => {
    try {
      const { data } = await api.get("/admin/crane-users");
      setCraneList(data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCar(); fetchCraneList(); }, [id]);

  const confirmStatusChange = () => {
    Swal.fire({
      title:"Change Car Status",
      html:`
        <p style="color:#6b7280;font-size:14px;margin-bottom:12px">
          Select new status for <strong>${car?.carDetail?.make} ${car?.carDetail?.model}</strong>
        </p>
        <select id="swal-status" class="swal2-input" style="width:100%;margin:0">
          ${ALL_STATUSES.map(s=>`<option value="${s}" ${car?.status===s?"selected":""}>${STATUS_LABELS[s]}</option>`).join("")}
        </select>`,
      showCancelButton:true, confirmButtonColor:"#166534", cancelButtonColor:"#6b7280",
      confirmButtonText:"Update Status",
      preConfirm:() => {
        const val = document.getElementById("swal-status").value;
        if (!val) Swal.showValidationMessage("Please select a status");
        return val;
      },
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await api.put(`/admin/cars/${id}/status`, { status:result.value });
          Swal.fire({ icon:"success", title:"Updated!", timer:1800, showConfirmButton:false });
          fetchCar();
        } catch { Swal.fire({ icon:"error", title:"Failed", text:"Could not update status." }); }
      }
    });
  };

  const confirmDelete = () => {
    Swal.fire({
      title:"Delete this listing?",
      text:`${car?.carDetail?.make} ${car?.carDetail?.model} (${car?.rcNumber}) will be permanently deleted.`,
      icon:"warning", showCancelButton:true,
      confirmButtonColor:"#ef4444", cancelButtonColor:"#6b7280", confirmButtonText:"Yes, delete!",
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin/cars/${id}`);
          Swal.fire({ icon:"success", title:"Deleted!", timer:1800, showConfirmButton:false });
          navigate(-1);
        } catch { Swal.fire({ icon:"error", title:"Error", text:"Failed to delete." }); }
      }
    });
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:400, flexDirection:"column", gap:14, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:44, height:44, border:"3px solid #dcfce7",
        borderTop:"3px solid #16a34a", borderRadius:"50%",
        animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#9ca3af", fontSize:14 }}>Loading car details...</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  if (!car) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <Car size={48} color="#d1d5db" style={{ marginBottom:12 }} />
      <p style={{ color:"#6b7280", fontSize:15 }}>Car not found.</p>
      <button onClick={() => navigate(-1)} style={{ marginTop:12,
        padding:"8px 20px", background:"#0f2412", color:"#fff",
        border:"none", borderRadius:8, cursor:"pointer", fontSize:14 }}>
        Go Back
      </button>
    </div>
  );

  const cd = car.carDetail || {};

  const buildAllImgs = (car) => {
    if (!car) return [];
    return [
      car.frontImage?.image    && { src: car.frontImage.image,    label: "Front" },
      car.backImage?.image     && { src: car.backImage.image,     label: "Back" },
      car.rcFrontImage?.image  && { src: car.rcFrontImage.image,  label: "RC Front" },
      car.rcBackImage?.image   && { src: car.rcBackImage.image,   label: "RC Back" },
      car.chassisImage?.image  && { src: car.chassisImage.image,  label: "Chassis" },
      car.engineImage?.image   && { src: car.engineImage.image,   label: "Engine" },
      car.tyreImage?.image     && { src: car.tyreImage.image,     label: "Tyre" },
      car.odometerImage?.image && { src: car.odometerImage.image, label: "Odometer" },
      ...(car.images||[]).map((img,i) => ({ src: img.image, label: `Inspection ${i+1}` })),
    ].filter(Boolean);
  };

  const craneManObj = typeof car.craneMan === "object" && car.craneMan !== null
    ? car.craneMan
    : craneList.find(c => c._id === car.craneMan);

  /* ── Layout: desktop = 2-col, mobile/tablet = 1-col ── */
  const mainLayout = isDesktop
    ? { display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }
    : { display:"flex", flexDirection:"column", gap:0 };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding: isMobile ? "12px 12px" : "0",
      fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* ── Lightbox ── */}
      {lightbox.open && (
        <>
          <div onClick={closeLightbox} style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.92)",
            backdropFilter:"blur(6px)", zIndex:2000,
            display:"flex", alignItems:"center", justifyContent:"center",
          }} />

          <div style={{
            position:"fixed", inset:0, zIndex:2001,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            padding: isMobile ? "60px 12px 80px" : "20px",
            pointerEvents:"none",
          }}>

            <button onClick={closeLightbox} style={{
              position:"fixed", top: isMobile ? 12 : 20, right: isMobile ? 12 : 20,
              width:40, height:40, borderRadius:10,
              background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)",
              color:"#fff", cursor:"pointer", fontSize:20, lineHeight:1,
              display:"flex", alignItems:"center", justifyContent:"center",
              pointerEvents:"all",
            }}>✕</button>

            <div style={{
              position:"fixed", top: isMobile ? 12 : 24, left:"50%", transform:"translateX(-50%)",
              background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:20, padding:"5px 16px",
              display:"flex", alignItems:"center", gap:10,
              pointerEvents:"none",
            }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{lightbox.label}</span>
              {lightbox.allImgs.length > 1 && (
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>
                  {lightbox.idx + 1} / {lightbox.allImgs.length}
                </span>
              )}
            </div>

            <img
              src={lightbox.src}
              alt={lightbox.label}
              style={{
                maxWidth: isMobile ? "100%" : "min(900px, 90vw)",
                maxHeight: isMobile ? "70vh" : "80vh",
                borderRadius:12, objectFit:"contain",
                boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
                pointerEvents:"none", userSelect:"none",
              }}
            />

            {lightbox.allImgs.length > 1 && (
              <>
                <button onClick={lbPrev} style={{
                  position:"fixed", left: isMobile ? 6 : 20, top:"50%", transform:"translateY(-50%)",
                  width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius:10,
                  background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)",
                  color:"#fff", cursor:"pointer", fontSize:20,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  pointerEvents:"all",
                }}>‹</button>
                <button onClick={lbNext} style={{
                  position:"fixed", right: isMobile ? 6 : 20, top:"50%", transform:"translateY(-50%)",
                  width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius:10,
                  background:"rgba(255,255,255,0.12)", border:"1.5px solid rgba(255,255,255,0.2)",
                  color:"#fff", cursor:"pointer", fontSize:20,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  pointerEvents:"all",
                }}>›</button>
              </>
            )}

            {lightbox.allImgs.length > 1 && (
              <div style={{
                position:"fixed", bottom: isMobile ? 10 : 20, left:"50%", transform:"translateX(-50%)",
                display:"flex", gap:5, padding:"6px 10px",
                background:"rgba(0,0,0,0.5)", borderRadius:10,
                maxWidth:"90vw", overflowX:"auto",
                pointerEvents:"all",
              }}>
                {lightbox.allImgs.map((img, i) => (
                  <div key={i}
                    onClick={() => setLightbox(prev => ({ ...prev, idx:i, src:img.src, label:img.label }))}
                    style={{
                      width: isMobile ? 38 : 46, height: isMobile ? 38 : 46,
                      flexShrink:0, borderRadius:6, overflow:"hidden",
                      cursor:"pointer",
                      border:`2px solid ${lightbox.idx===i ? "#22c55e" : "rgba(255,255,255,0.2)"}`,
                      opacity: lightbox.idx===i ? 1 : 0.55,
                    }}
                  >
                    <img src={img.src} alt={img.label} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <AssignCraneManModal
          craneList={craneList}
          currentCraneManId={craneManObj?._id || car.craneMan}
          carId={id}
          onClose={() => setShowAssign(false)}
          onAssigned={fetchCar}
        />
      )}

      {/* ── Top Bar ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom: isMobile ? 16 : 28,
        flexWrap: isMobile ? "nowrap" : "wrap",
        gap:10,
        position:"relative",
      }}>
        {/* Left: back + title */}
        <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0, flex:1 }}>
          <button onClick={() => navigate(-1)} style={{
            width:36, height:36, borderRadius:10, border:"1.5px solid #e5e7eb",
            background:"#fff", cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0,
          }}>
            <ArrowLeft size={16} color="#374151" />
          </button>
          <div style={{ minWidth:0 }}>
            <h1 style={{ margin:0, fontSize: isMobile ? 18 : 24, fontWeight:700,
              color:"#0f172a", letterSpacing:"-0.5px",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {cd.make||"—"} {cd.model||""}
            </h1>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#6b7280",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {car.rcNumber} · {cd.manufacturingYear}
            </p>
          </div>
        </div>

        {/* Action Buttons — inline on desktop/tablet, dropdown on mobile */}
        {isMobile ? (
          <div style={{ position:"relative", flexShrink:0 }}>
            <button
              onClick={() => setActionMenuOpen(prev => !prev)}
              style={{
                width:36, height:36, borderRadius:10, border:"1.5px solid #e5e7eb",
                background:"#fff", cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center", gap:2,
              }}
            >
              <span style={{ width:4, height:4, borderRadius:"50%", background:"#374151", display:"block" }} />
              <span style={{ width:4, height:4, borderRadius:"50%", background:"#374151", display:"block" }} />
              <span style={{ width:4, height:4, borderRadius:"50%", background:"#374151", display:"block" }} />
            </button>

            {actionMenuOpen && (
              <>
                <div onClick={() => setActionMenuOpen(false)}
                  style={{ position:"fixed", inset:0, zIndex:500 }} />
                <div style={{
                  position:"absolute", top:42, right:0, zIndex:600,
                  background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:12,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
                  minWidth:200, overflow:"hidden",
                  animation:"fadeIn 0.12s ease",
                }}>
                  {[
                    { label: craneManObj ? "Reassign Crane Man" : "Assign Crane Man",
                      icon: <Wrench size={13} />, color:"#166534", bg:"#f0fdf4",
                      action:() => { setShowAssign(true); setActionMenuOpen(false); } },
                    { label:"Change Status", icon:<RefreshCw size={13} />, color:"#1d4ed8", bg:"#eff6ff",
                      action:() => { confirmStatusChange(); setActionMenuOpen(false); } },
                    { label:"Delete", icon:<Trash2 size={13} />, color:"#be123c", bg:"#fff1f2",
                      action:() => { confirmDelete(); setActionMenuOpen(false); } },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} style={{
                      display:"flex", alignItems:"center", gap:9,
                      width:"100%", padding:"12px 16px",
                      background: "transparent", border:"none",
                      color: item.color, fontSize:13, fontWeight:600,
                      cursor:"pointer", textAlign:"left",
                      borderBottom: i < 2 ? "1px solid #f3f4f6" : "none",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = item.bg}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {item.icon}{item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={() => setShowAssign(true)} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 14px", borderRadius:10,
              border:"1.5px solid #bbf7d0", background:"#f0fdf4",
              color:"#166534", fontSize:13, fontWeight:600, cursor:"pointer",
            }}>
              <Wrench size={14} />
              {craneManObj ? "Reassign Crane Man" : "Assign Crane Man"}
            </button>

            <button onClick={confirmStatusChange} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 14px", borderRadius:10,
              border:"1.5px solid #bfdbfe", background:"#eff6ff",
              color:"#1d4ed8", fontSize:13, fontWeight:600, cursor:"pointer",
            }}>
              <RefreshCw size={14} /> Change Status
            </button>

            <button onClick={confirmDelete} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"9px 14px", borderRadius:10,
              border:"1.5px solid #fecaca", background:"#fff1f2",
              color:"#be123c", fontSize:13, fontWeight:600, cursor:"pointer",
            }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Two-column layout (desktop) / stacked (mobile/tablet) ── */}
      <div style={mainLayout}>

        {/* LEFT / TOP */}
        <div>
          {/* Status bar */}
          <div style={{
            background:"#fff", border:"1.5px solid #e7f3e8", borderRadius:16,
            padding: isMobile ? "12px 14px" : "16px 20px", marginBottom:20,
            display:"flex", alignItems:"flex-start", flexDirection: isMobile ? "column" : "row",
            flexWrap:"wrap", gap: isMobile ? 10 : 16,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>Status</span>
              <Badge bg={STATUS_COLORS[car.status]?.bg||"#f3f4f6"}
                text={STATUS_COLORS[car.status]?.text||"#374151"}
                border={STATUS_COLORS[car.status]?.border||"#e5e7eb"}>
                {STATUS_LABELS[car.status]||car.status||"—"}
              </Badge>
            </div>
            {!isMobile && <div style={{ width:1, height:24, background:"#e5e7eb" }} />}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 16px" }}>
              <BoolField label="Running Condition" value={car.isRunningCondition} />
              <BoolField label="Missing Part"      value={car.anyMissingPart} />
              <BoolField label="Only for Check"    value={car.onlyForCheck} />
              <BoolField label="Payment Done"      value={car.isPaid} />
            </div>
          </div>

          {/* Car Details */}
          <Section title="Car Details" icon={Car}>
            <Grid>
              <Field label="Make"            value={cd.make} />
              <Field label="Model"           value={cd.model} />
              <Field label="Year"            value={cd.manufacturingYear} />
              <Field label="Color"           value={cd.color} />
              <Field label="Fuel Type"       value={cd.fuelType} />
              <Field label="Body Type"       value={cd.bodyType} />
              <Field label="Vehicle Class"   value={cd.vehicleClass} />
              <Field label="Seating"         value={cd.seatingCapacity} />
              <Field label="Standing"        value={cd.standingCapacity} />
              <Field label="Unladen Weight"  value={cd.unladenWeight ? `${cd.unladenWeight} kg` : undefined} />
              <Field label="GVW"             value={cd.grossVehicleWeight ? `${cd.grossVehicleWeight} kg` : undefined} />
              <Field label="KM Driven"       value={car.kmDriven ? `${Number(car.kmDriven).toLocaleString("en-IN")} km` : undefined} />
            </Grid>
          </Section>

          {/* Registration */}
          <Section title="Registration & Documents" icon={FileText}>
            <Grid>
              <Field label="RC Number"           value={cd.rcNumber||car.rcNumber} />
              <Field label="Registration Date"   value={cd.registrationDate} />
              <Field label="Registration Valid"  value={cd.registrationValidity} />
              <Field label="Insurance Valid"     value={cd.insuranceValidity} />
              <Field label="Pollution Valid"     value={cd.pollutionValidity} />
              <Field label="RC Status"           value={cd.status} />
              <Field label="Owner Name"          value={cd.ownerName} />
              <Field label="Father Name"         value={cd.fatherName} />
              <Field label="RTO Office"          value={cd.rtoOffice} />
              <Field label="Vehicle Category"    value={cd.vehicleCategory} />
              <Field label="Chassis Number"      value={cd.chassisNumber} />
              <Field label="Engine Number"       value={cd.engineNumber} />
              <Field label="Address" full        value={cd.address} />
            </Grid>
          </Section>

          {/* Payment */}
          <Section title="Payment Details" icon={CreditCard}>
            <Grid cols={2}>
              <Field label="Price"            value={car.price ? `₹${Number(car.price).toLocaleString("en-IN")}` : undefined} />
              <Field label="Payment Method"   value={car.paymentMethod?.toUpperCase()} />
              <Field label="UPI ID"           value={car.paymentDetails?.upiId} />
              <Field label="Account Holder"   value={car.paymentDetails?.accountHolderName} />
              <Field label="Account Number"   value={car.paymentDetails?.accountNumber} />
              <Field label="Bank Name"        value={car.paymentDetails?.bankName} />
              <Field label="IFSC Code"        value={car.paymentDetails?.ifscCode} />
            </Grid>
          </Section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* Image Gallery */}
          <Section title="Photos" icon={Image}>
            {(() => {
              const groups = [
                { label:"Front",    imgs: car.frontImage?.image    ? [car.frontImage.image]    : [] },
                { label:"Back",     imgs: car.backImage?.image     ? [car.backImage.image]     : [] },
                { label:"RC Front", imgs: car.rcFrontImage?.image  ? [car.rcFrontImage.image]  : [] },
                { label:"RC Back",  imgs: car.rcBackImage?.image   ? [car.rcBackImage.image]   : [] },
                { label:"Chassis",  imgs: car.chassisImage?.image  ? [car.chassisImage.image]  : [] },
                { label:"Engine",   imgs: car.engineImage?.image   ? [car.engineImage.image]   : [] },
                { label:"Tyre",     imgs: car.tyreImage?.image     ? [car.tyreImage.image]     : [] },
                { label:"Odometer", imgs: car.odometerImage?.image ? [car.odometerImage.image] : [] },
              ].filter(g => g.imgs.length > 0);
              const flat = buildAllImgs(car).filter(x => !x.label.startsWith("Inspection"));
              if (groups.length === 0)
                return <p style={{ textAlign:"center", color:"#9ca3af", fontSize:13 }}>No images uploaded</p>;

              /* On mobile/tablet: show a horizontal scrolling row instead of label+grid */
              if (!isDesktop) {
                const allFlat = flat;
                return (
                  <div style={{ overflowX:"auto", display:"flex", gap:10,
                    paddingBottom:6, scrollbarWidth:"thin" }}>
                    {allFlat.map((img, i) => (
                      <div key={i} onClick={() => openLightbox(img.src, img.label, allFlat, i)}
                        style={{
                          flexShrink:0, width:90, display:"flex", flexDirection:"column", gap:4,
                        }}>
                        <div style={{
                          width:90, height:70, borderRadius:9, overflow:"hidden",
                          border:"1.5px solid #e5e7eb", cursor:"zoom-in",
                        }}>
                          <img src={img.src} alt={img.label}
                            style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        </div>
                        <p style={{ margin:0, fontSize:10, color:"#9ca3af", textAlign:"center",
                          textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>
                          {img.label}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              }

              return groups.map(group => (
                <div key={group.label} style={{ marginBottom:14 }}>
                  <p style={{ margin:"0 0 6px", fontSize:10, fontWeight:700, color:"#9ca3af",
                    textTransform:"uppercase", letterSpacing:"0.1em" }}>{group.label}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                    {group.imgs.map((src,i) => {
                      const flatIdx = flat.findIndex(x => x.src === src);
                      return (
                        <div key={i} onClick={() => openLightbox(src, group.label, flat, flatIdx >= 0 ? flatIdx : 0)}
                          style={{
                            aspectRatio:"1", borderRadius:7, overflow:"hidden", cursor:"zoom-in",
                            border:"1.5px solid #e5e7eb", transition:"all 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor="#16a34a"; e.currentTarget.style.transform="scale(1.03)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.transform="none"; }}
                        >
                          <img src={src} alt={group.label} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </Section>

          {/* After Inspection */}
          {car.images && car.images.length > 0 && (
            <Section title="After Inspection" icon={Image}>
              <div style={{
                display: isDesktop ? "grid" : "flex",
                gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : undefined,
                flexDirection: isDesktop ? undefined : "row",
                overflowX: isDesktop ? undefined : "auto",
                gap:6, paddingBottom: isDesktop ? 0 : 4,
              }}>
                {car.images.map((img,i) => {
                  const flat = buildAllImgs(car).filter(x => x.label.startsWith("Inspection"));
                  return (
                    <div key={i}
                      onClick={() => openLightbox(img.image, `Inspection ${i+1}`, flat, i)}
                      style={{
                        aspectRatio:"1",
                        width: isDesktop ? undefined : 80,
                        flexShrink: isDesktop ? undefined : 0,
                        borderRadius:7, overflow:"hidden", cursor:"zoom-in",
                        border:"1.5px solid #e5e7eb", transition:"all 0.15s",
                      }}
                    >
                      <img src={img.image} alt={`Inspection ${i+1}`}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Seller Info */}
          <Section title="Seller" icon={User}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#dcfce7",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:700, color:"#166534", flexShrink:0 }}>
                  {(car.seller?.name||"S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#111827" }}>{car.seller?.name||"—"}</p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>Seller</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#374151" }}>
                <Phone size={13} color="#9ca3af" />{car.seller?.phone||"—"}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#374151" }}>
                <Mail size={13} color="#9ca3af" />{car.seller?.email||"—"}
              </div>
            </div>
          </Section>

          {/* Crane Man */}
          <Section title="Crane Man" icon={Wrench}>
            {craneManObj ? (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {craneManObj.userImage?.img ? (
                    <img src={craneManObj.userImage.img} alt={craneManObj.name} style={{
                      width:44, height:44, borderRadius:11, objectFit:"cover",
                      border:"2px solid #bbf7d0", flexShrink:0,
                    }} />
                  ) : (
                    <div style={{ width:44, height:44, borderRadius:11, background:"#ede9fe",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:17, fontWeight:700, color:"#5b21b6", flexShrink:0 }}>
                      {(craneManObj.name||"C").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#111827" }}>{craneManObj.name||"—"}</p>
                    <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>Crane Man</p>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#374151" }}>
                  <Phone size={13} color="#9ca3af" />{craneManObj.phone||"—"}
                </div>
                {craneManObj.address && (
                  <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#374151" }}>
                    <MapPin size={13} color="#9ca3af" />{craneManObj.address}
                  </div>
                )}
                {craneManObj.upiDetails?.upiId && (
                  <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>
                    UPI: {craneManObj.upiDetails.upiId}
                  </p>
                )}
                <button onClick={() => setShowAssign(true)} style={{
                  marginTop:4, padding:"8px 14px", borderRadius:9,
                  border:"1.5px solid #bbf7d0", background:"#f0fdf4",
                  color:"#166534", fontSize:12, fontWeight:600, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  <RefreshCw size={13} /> Reassign
                </button>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <Wrench size={30} color="#d1d5db" style={{ marginBottom:8 }} />
                <p style={{ margin:"0 0 12px", fontSize:13, color:"#9ca3af" }}>No crane man assigned</p>
                <button onClick={() => setShowAssign(true)} style={{
                  padding:"9px 18px", borderRadius:9,
                  border:"none", background:"#0f2412",
                  color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
                  display:"inline-flex", alignItems:"center", gap:6,
                }}>
                  <Wrench size={14} /> Assign Now
                </button>
              </div>
            )}
          </Section>

          {/* Pickup Location */}
          <Section title="Pickup Location" icon={MapPin}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
              <MapPin size={15} color="#9ca3af" style={{ marginTop:2, flexShrink:0 }} />
              <p style={{ margin:0, fontSize:14, color:"#374151", lineHeight:1.5 }}>
                {car.pickupLocation||"—"}
              </p>
            </div>
          </Section>

          {/* Timestamps */}
          <div style={{ background:"#f8fffe", border:"1.5px solid #e7f3e8", borderRadius:12,
            padding:"14px 16px", display:"flex", flexDirection:"column", gap:8,
            marginBottom: isMobile ? 24 : 0 }}>
            {[
              { label:"Created",      val:car.createdAt },
              { label:"Last Updated", val:car.updatedAt },
            ].map(ts => (
              <div key={ts.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:"#9ca3af", fontWeight:500 }}>{ts.label}</span>
                <span style={{ color:"#374151", fontWeight:600 }}>
                  {ts.val ? new Date(ts.val).toLocaleDateString("en-IN",
                    { day:"2-digit", month:"short", year:"numeric" }) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}