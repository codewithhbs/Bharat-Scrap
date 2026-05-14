'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'bharat_scrap_listing';

function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadProgress() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function clearProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  green:       '#04A03F',
  greenDark:   '#027830',
  greenDeep:   '#025525',
  greenLight:  '#E8F8EE',
  greenMid:    '#C6EDCF',
  blue:        '#1356CC',
  blueDark:    '#0D3B8C',
  text:        '#111827',
  textMid:     '#4B5563',
  textSoft:    '#9CA3AF',
  border:      '#E5E7EB',
  bg:          '#F9FAFB',
  white:       '#FFFFFF',
  error:       '#DC2626',
  errorBg:     '#FEF2F2',
  errorBorder: '#FCA5A5',
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F0F4F0; }
    input, textarea, select, button { font-family: inherit; }
    input::placeholder { color: ${C.textSoft}; }
    input[type=range] { accent-color: ${C.green}; cursor: pointer; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.greenMid}; border-radius: 4px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.55); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes pop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.07); }
      100% { transform: scale(1); }
    }
    @keyframes checkDraw { to { stroke-dashoffset: 0; } }

    .btn-primary {
      width: 100%; background: linear-gradient(135deg, ${C.green}, ${C.greenDark});
      border: none; border-radius: 14px; height: 52px;
      color: #fff; font-size: 15px; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 18px rgba(4,160,63,0.32); letter-spacing: 0.01em;
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, ${C.greenDark}, ${C.greenDeep});
      transform: translateY(-1px); box-shadow: 0 6px 24px rgba(4,160,63,0.38);
    }
    .btn-primary:active:not(:disabled) { transform: translateY(0) scale(0.98); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-ghost {
      width: 100%; background: ${C.white};
      border: 1.5px solid ${C.border}; border-radius: 14px; height: 50px;
      color: ${C.textMid}; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; transition: all 0.18s;
    }
    .btn-ghost:hover { border-color: ${C.green}; color: ${C.green}; background: ${C.greenLight}; }

    .field-label {
      display: block; font-size: 11px; font-weight: 800;
      color: ${C.textMid}; margin-bottom: 7px;
      letter-spacing: 0.07em; text-transform: uppercase;
    }
    .field-input {
      width: 100%; background: ${C.bg}; border: 1.5px solid ${C.border};
      border-radius: 13px; padding: 0 16px; height: 50px;
      font-size: 15px; color: ${C.text}; outline: none;
      transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; font-weight: 600;
    }
    .field-input:focus { border-color: ${C.green}; background: ${C.white}; box-shadow: 0 0 0 3px ${C.greenLight}; }
    .field-input.error { border-color: ${C.error}; background: ${C.errorBg}; }

    .section-card {
      background: ${C.white}; border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.06); padding: 20px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.04); margin-bottom: 16px;
    }
    .section-title { font-size: 14px; font-weight: 800; color: ${C.text}; margin-bottom: 16px; }

    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0; border-bottom: 1px solid ${C.border};
    }
    .toggle-row:last-child { border-bottom: none; }

    .toggle-switch { position: relative; width: 48px; height: 27px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-track {
      position: absolute; inset: 0; border-radius: 27px;
      background: #D1D5DB; cursor: pointer; transition: background 0.22s;
    }
    .toggle-track::before {
      content: ''; position: absolute; width: 21px; height: 21px; border-radius: 50%;
      background: white; left: 3px; top: 3px; transition: transform 0.22s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    }
    input:checked + .toggle-track { background: ${C.green}; }
    input:checked + .toggle-track::before { transform: translateX(21px); }

    .spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .spec-item { background: ${C.bg}; border-radius: 14px; padding: 14px; border: 1px solid ${C.border}; }
    .spec-label { font-size: 11px; color: ${C.textSoft}; font-weight: 600; margin-bottom: 4px; }
    .spec-value { font-size: 15px; font-weight: 800; color: ${C.text}; }

    .rto-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 10px 0; border-bottom: 1px solid #F3F4F6; gap: 12px;
    }
    .rto-row:last-child { border-bottom: none; }
    .rto-key { font-size: 12px; color: ${C.textSoft}; font-weight: 500; }
    .rto-val { font-size: 13px; font-weight: 700; color: ${C.text}; text-align: right; flex: 1; }

    .breakdown-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 11px 0; border-bottom: 1px solid #F3F4F6;
    }
    .breakdown-row:last-child { border-bottom: none; }
    .breakdown-label { font-size: 13px; color: ${C.textMid}; }
    .breakdown-val { font-size: 13px; font-weight: 700; color: ${C.text}; }
    .breakdown-pos { color: ${C.green}; }
    .breakdown-neg { color: ${C.error}; }

    .img-slot {
      aspect-ratio: 1; border-radius: 13px; overflow: hidden;
      border: 1.5px dashed ${C.border}; background: ${C.bg};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.18s, background 0.18s; position: relative;
    }
    .img-slot:hover { border-color: ${C.green}; background: ${C.greenLight}; }
    .img-slot.filled { border-style: solid; border-color: ${C.green}; }

    .upload-box {
      border: 1.5px dashed ${C.border}; border-radius: 14px; height: 170px; background: ${C.bg};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; overflow: hidden; transition: border-color 0.18s, background 0.18s;
    }
    .upload-box:hover { border-color: ${C.green}; background: ${C.greenLight}; }

    .toast {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; align-items: center; gap: 10px;
      padding: 13px 20px; border-radius: 14px; font-size: 13px; font-weight: 700;
      max-width: 340px; width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); animation: slideDown 0.28s ease;
    }
    .toast-success { background: #0A2E17; color: #6FD48A; border: 1px solid rgba(111,212,138,0.22); }
    .toast-error   { background: #DC2626; color: #fff; }
    .toast-info    { background: #1E3A5F; color: #fff; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
      {type === 'error'   && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
    </svg>
  );
}

function PageHeader({ title, onBack, step, totalSteps }) {
  const stepLabels = ['RC Number', 'Car Details', 'Condition', 'Price', 'Done'];
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
            <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>Step {step} of {totalSteps} · {stepLabels[step - 1]}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.greenLight, border: `1.5px solid ${C.greenMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: C.greenDark }}>
            {step}/{totalSteps}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {Array(totalSteps).fill(0).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 5, background: i < step ? C.green : '#E9EDE9', transition: 'background 0.4s' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 10, padding: '10px 13px', marginTop: 8 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ fontSize: 12, color: C.error, fontWeight: 600 }}>{msg}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — RC INPUT
// ─────────────────────────────────────────────────────────────────────────────
function formatPlate(val) {
  const clean = val.replace(/\s/g, '').toUpperCase();
  const match = clean.match(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,2})(\d*)$/);
  if (match) return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
  return clean;
}

function StepRCInput({ onNext, savedData, onSave }) {
  const [rcNum,        setRcNum]        = useState(savedData?.rcNum || '');
  const [plateDisplay, setPlateDisplay] = useState(savedData?.rcNum ? formatPlate(savedData.rcNum) : 'MH 01 AB 1234');
  const [frontPreview, setFrontPreview] = useState(savedData?.rcFrontPreview || null);
  const [backPreview,  setBackPreview]  = useState(savedData?.rcBackPreview  || null);
  const [frontFile,    setFrontFile]    = useState(null);   // ✅ actual File object
  const [backFile,     setBackFile]     = useState(null);   // ✅ actual File object
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const frontRef = useRef(null);
  const backRef  = useRef(null);

  const handleChange = (val) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRcNum(upper);
    setError('');
    setPlateDisplay(formatPlate(upper) || 'MH 01 AB 1234');
  };

  // ✅ Store actual File object — preview alag, file alag
  const handleImagePick = (side, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (side === 'front') {
      setFrontPreview(previewUrl);
      setFrontFile(file);
      onSave({ rcFrontPreview: previewUrl });
    } else {
      setBackPreview(previewUrl);
      setBackFile(file);
      onSave({ rcBackPreview: previewUrl });
    }
    setError('');
  };

  const submit = async () => {
    if (rcNum.length < 5)         { setError('Please enter a valid RC number (min 5 chars)'); return; }
    if (!frontFile || !backFile)  { setError('Please upload both RC front and back images'); return; }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('rcNumber',    rcNum.trim().toUpperCase());
      formData.append('onlyForCheck','false');
      formData.append('rcFrontImage', frontFile, frontFile.name);  // ✅ direct File
      formData.append('rcBackImage',  backFile,  backFile.name);   // ✅ direct File

      // ✅ axios se — api.post
      const res = await api.post('/car/car-register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onSave({ rcNum, carData: res.data.data });
        onNext(res.data.data);
      } else {
        setError(res.data.message || 'Failed to register car');
      }
    } catch (err) {
      console.log('RC Register Error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || 'Network error. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeUp 0.32s ease' }}>
      {/* Number plate preview */}
      <div style={{ background: C.white, border: `3px solid ${C.text}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center', marginBottom: 20, boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.blue, letterSpacing: 3, marginBottom: 4, textTransform: 'uppercase' }}>INDIA · भारत</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: 4, fontVariant: 'tabular-nums' }}>{plateDisplay}</div>
      </div>

      {/* RC Number */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label">RC Registration Number</label>
        <input
          className="field-input"
          placeholder="e.g. MH01AB1234"
          value={rcNum}
          onChange={e => handleChange(e.target.value)}
          maxLength={11}
          style={{ letterSpacing: 2, textTransform: 'uppercase' }}
        />
      </div>

      {/* Front image */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label">RC Front Side Photo</label>
        <div className="upload-box" onClick={() => frontRef.current?.click()}>
          {frontPreview
            ? <img src={frontPreview} alt="RC Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', color: C.textSoft }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>Tap to upload Front Side</div>
                <div style={{ fontSize: 11, marginTop: 3 }}>RC card front photo</div>
              </div>
          }
        </div>
        <input ref={frontRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImagePick('front', e)} />
      </div>

      {/* Back image */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label">RC Back Side Photo</label>
        <div className="upload-box" onClick={() => backRef.current?.click()}>
          {backPreview
            ? <img src={backPreview} alt="RC Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ textAlign: 'center', color: C.textSoft }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>Tap to upload Back Side</div>
                <div style={{ fontSize: 11, marginTop: 3 }}>RC card back photo</div>
              </div>
          }
        </div>
        <input ref={backRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImagePick('back', e)} />
      </div>

      <ErrorBox msg={error} />
      <div style={{ height: 16 }} />
      <button className="btn-primary" onClick={submit} disabled={loading}>
        {loading
          ? <><Spinner /> Fetching Details…</>
          : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Get Car Details</>
        }
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CAR DETAILS
// ─────────────────────────────────────────────────────────────────────────────
function CarSVG() {
  return (
    <svg width="220" height="100" viewBox="0 0 240 110" fill="none">
      <ellipse cx="120" cy="95" rx="100" ry="8" fill="rgba(0,0,0,0.07)" />
      <rect x="20" y="50" width="200" height="42" rx="8" fill={C.green} opacity="0.2" />
      <rect x="24" y="52" width="192" height="38" rx="7" fill={C.green} opacity="0.35" />
      <path d="M50 52 L74 24 H166 L190 52" fill={C.greenDark} opacity="0.7" />
      <rect x="78" y="26" width="84" height="26" rx="3" fill="#A8D8B0" opacity="0.5" />
      <rect x="80" y="27" width="36" height="23" rx="2" fill="#C8EDD0" opacity="0.6" />
      <rect x="124" y="27" width="36" height="23" rx="2" fill="#C8EDD0" opacity="0.6" />
      <circle cx="65"  cy="90" r="18" fill="#374151" />
      <circle cx="65"  cy="90" r="10" fill="#6B7280" />
      <circle cx="65"  cy="90" r="5"  fill="#9CA3AF" />
      <circle cx="175" cy="90" r="18" fill="#374151" />
      <circle cx="175" cy="90" r="10" fill="#6B7280" />
      <circle cx="175" cy="90" r="5"  fill="#9CA3AF" />
      <rect x="20"  y="60" width="14" height="8" rx="2" fill="#FEF9C3" />
      <rect x="206" y="60" width="14" height="8" rx="2" fill="#FCA5A5" />
    </svg>
  );
}

function StepCarDetails({ carData, rcNumber, onNext, onBack }) {
  if (!carData) return (
    <div style={{ textAlign: 'center', padding: 60, color: C.textSoft }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
      <div>No car data found</div>
      <button className="btn-ghost" style={{ marginTop: 20, width: 'auto', padding: '0 24px' }} onClick={onBack}>Go Back</button>
    </div>
  );

  const specs = [
    { label: 'Manufacturing Year', value: carData.manufacturingYear, icon: '📅' },
    { label: 'Fuel Type',          value: carData.fuelType,          icon: '⛽' },
    { label: 'Vehicle Class',      value: carData.vehicleClass,      icon: '🏷️' },
    { label: 'Body Type',          value: carData.bodyType,          icon: '🚙' },
    { label: 'Color',              value: carData.color,             icon: '🎨' },
    { label: 'Seating Capacity',   value: carData.seatingCapacity,   icon: '💺' },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.32s ease' }}>
      <div style={{ background: `linear-gradient(135deg, ${C.greenLight} 0%, #EBF4FF 100%)`, borderRadius: 20, padding: '28px 20px', textAlign: 'center', marginBottom: 16, border: `1px solid ${C.greenMid}` }}>
        <CarSVG />
        <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginTop: 12 }}>{carData.make} {carData.model}</div>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>{carData.variant || carData.bodyType} · {rcNumber}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.greenLight, border: `1px solid ${C.greenMid}`, borderRadius: 20, padding: '4px 12px', marginTop: 10 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.greenDark }}>Data Verified from RC</span>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">Vehicle Specifications</div>
        <div className="spec-grid">
          {specs.map(s => (
            <div key={s.label} className="spec-item">
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div className="spec-label">{s.label}</div>
              <div className="spec-value">{s.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">Registration Details</div>
        {[
          ['Owner Name',              carData.ownerName],
          ['Father Name',             carData.fatherName],
          ['RTO Office',              carData.rtoOffice],
          ['Registration Date',       carData.registrationDate],
          ['Registration Valid Till', carData.registrationValidity],
        ].map(([k, v]) => (
          <div key={k} className="rto-row">
            <span className="rto-key">{k}</span>
            <span className="rto-val" style={k === 'Registration Valid Till' ? { color: C.green } : {}}>{v || '—'}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext}>
        Continue to Condition
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — CONDITION FORM
// ─────────────────────────────────────────────────────────────────────────────
const IMAGE_SLOTS = [
  { key: 'frontImage',    label: 'Front',    icon: '🚗' },
  { key: 'backImage',     label: 'Back',     icon: '🔙' },
  { key: 'chassisImage',  label: 'Chassis',  icon: '🔩' },
  { key: 'engineImage',   label: 'Engine',   icon: '⚙️' },
  { key: 'tyreImage',     label: 'Tyre',     icon: '🛞' },
  { key: 'odometerImage', label: 'Odometer', icon: '📍' },
];

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div style={{ flex: 1, marginRight: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>{sub}</div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-track" />
      </label>
    </div>
  );
}

function StepConditionForm({ rcNumber, carData, onNext, onBack, savedData, onSave }) {
  const [km,          setKm]      = useState(savedData?.km          ?? 45000);
  const [scratches,   setScratch] = useState(savedData?.scratches   ?? false);
  const [accidents,   setAccid]   = useState(savedData?.accidents   ?? false);
  const [isRunning,   setRunning] = useState(savedData?.isRunning   ?? true);
  const [missingPart, setMissing] = useState(savedData?.missingPart ?? false);
  const [pickup,      setPickup]  = useState(savedData?.pickup      ?? '');
  const [previews,    setPreviews]= useState({});    // objectURLs — sirf preview ke liye
  const [imageFiles,  setImageFiles] = useState({}); // ✅ actual File objects
  const [loading,     setLoading] = useState(false);
  const [toast,       setToast]   = useState({ msg: '', type: 'info' });
  const fileRefs = useRef({});

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'info' }), 2500);
  };

  // ✅ Preview aur File dono alag store karo
  const handleImagePick = (slotKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviews(prev  => ({ ...prev,  [slotKey]: url }));
    setImageFiles(prev => ({ ...prev, [slotKey]: file }));
  };

  const submit = async () => {
    if (!imageFiles.frontImage) { showToast('Please upload at least the front photo', 'error'); return; }

    setLoading(true);
    onSave({ km, scratches, accidents, isRunning, missingPart, pickup });

    try {
      const formData = new FormData();

      // ✅ Direct File objects append karo
      for (const { key } of IMAGE_SLOTS) {
        if (imageFiles[key]) {
          formData.append(key, imageFiles[key], imageFiles[key].name);
        }
      }

      formData.append('kmDriven',           km.toString());
      formData.append('isScrateched',       scratches.toString());
      formData.append('isAccident',         accidents.toString());
      formData.append('isRunningCondition', isRunning.toString());
      formData.append('anyMissingPart',     missingPart.toString());
      formData.append('pickupLocation',     pickup);

      // ✅ axios api.put
      const res = await api.put(`/car/car-detail-update/${rcNumber}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (res.data?.success) {
        onNext(res.data.data || carData);
      } else {
        showToast(res.data?.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.log('Condition Update Error:', err.response?.data || err.message);
      const status = err.response?.status;
      if (status === 400)      showToast(err.response?.data?.message || 'Invalid request.');
      else if (status === 404) showToast('Car not found with this RC number.');
      else if (status === 500) showToast('Server error. Please try again later.');
      else                     showToast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = Object.keys(imageFiles).length;

  return (
    <>
      <Toast {...toast} />
      <div style={{ animation: 'fadeUp 0.32s ease' }}>

        {/* KM Driven */}
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>KM Driven</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{Number(km).toLocaleString('en-IN')} km</div>
          </div>
          <input
            type="range" min="0" max="200000" step="1000"
            value={km} onChange={e => { setKm(Number(e.target.value)); onSave({ km: Number(e.target.value) }); }}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: C.textSoft }}>0 km</span>
            <span style={{ fontSize: 11, color: C.textSoft }}>2,00,000 km</span>
          </div>
        </div>

        {/* Pickup location */}
        <div className="section-card">
          <div className="section-title">Pickup Location</div>
          <input
            className="field-input"
            placeholder="e.g. Rohini West, New Delhi"
            value={pickup}
            onChange={e => { setPickup(e.target.value); onSave({ pickup: e.target.value }); }}
          />
        </div>

        {/* Toggles */}
        <div className="section-card">
          <div className="section-title">Vehicle Condition</div>
          <ToggleRow label="Scratches or Dents?"  sub="Visible damage on the car"      checked={scratches}   onChange={v => { setScratch(v); onSave({ scratches: v }); }} />
          <ToggleRow label="Major Accidents?"     sub="Any major collision history"     checked={accidents}   onChange={v => { setAccid(v);   onSave({ accidents: v }); }} />
          <ToggleRow label="Running Condition?"   sub="Is the car currently drivable"   checked={isRunning}   onChange={v => { setRunning(v); onSave({ isRunning: v }); }} />
          <ToggleRow label="Any Missing Parts?"   sub="Parts removed or not installed"  checked={missingPart} onChange={v => { setMissing(v); onSave({ missingPart: v }); }} />
        </div>

        {/* Photos grid */}
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Car Photos</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{uploadedCount}/6 uploaded</div>
          </div>
          <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 14 }}>Front photo is required. Others recommended.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {IMAGE_SLOTS.map(slot => (
              <div key={slot.key}>
                <div
                  className={`img-slot${previews[slot.key] ? ' filled' : ''}`}
                  onClick={() => fileRefs.current[slot.key]?.click()}
                >
                  {previews[slot.key]
                    ? <>
                        <img src={previews[slot.key]} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      </>
                    : <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{slot.icon}</div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      </div>
                  }
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: previews[slot.key] ? C.green : C.textSoft, marginTop: 4 }}>{slot.label}</div>
                <input
                  ref={el => fileRefs.current[slot.key] = el}
                  type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImagePick(slot.key, e)}
                />
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading
            ? <><Spinner /> Calculating…</>
            : <>Calculate Price <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
          }
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — PRICE RESULT
// ─────────────────────────────────────────────────────────────────────────────
function calculatePrice(carDetail) {
  if (!carDetail) return { fixedPrice: 320000, basePrice: 450000, yearDepreciation: 0, kmDepreciation: 0, ownerBonus: 0, marketDemand: 5000, notRunningPenalty: 0, missingPartPenalty: 0, age: 0, kmDriven: 45000 };
  const basePrice          = 450000;
  const currentYear        = new Date().getFullYear();
  const age                = currentYear - (carDetail.manufacturingYear || currentYear);
  const kmDriven           = carDetail.kmDriven || 45000;
  const yearDep            = Math.max(0, age * 12000);
  const kmDep              = Math.floor(kmDriven / 1000) * 800;
  const ownerBonus         = carDetail.ownerType === '1st Owner' ? 15000 : 0;
  const marketDemand       = 5000;
  const notRunningPenalty  = carDetail.isRunningCondition === false ? 50000 : 0;
  const missingPartPenalty = carDetail.anyMissingPart === true ? 25000 : 0;
  const fixedPrice = Math.max(50000, basePrice - yearDep - kmDep + ownerBonus + marketDemand - notRunningPenalty - missingPartPenalty);
  return { fixedPrice, basePrice, yearDepreciation: yearDep, kmDepreciation: kmDep, ownerBonus, marketDemand, notRunningPenalty, missingPartPenalty, age, kmDriven };
}

function StepPriceResult({ rcNumber, carDetail, onNext, onSave }) {
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ msg: '', type: 'info' });
  const [meterW,  setMeterW]  = useState(0);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'info' }), 2500);
  };

  useEffect(() => {
    const t = setTimeout(() => setMeterW(65), 300);
    return () => clearTimeout(t);
  }, []);

  const p         = calculatePrice(carDetail);
  const formatted = `₹${p.fixedPrice.toLocaleString('en-IN')}`;

  const breakdown = [
    { label: 'Base Market Price',                                   value: `₹${p.basePrice.toLocaleString('en-IN')}`,          type: 'normal' },
    { label: `Year Depreciation (${p.age} yrs)`,                   value: `−₹${p.yearDepreciation.toLocaleString('en-IN')}`,  type: 'neg'    },
    { label: `KM Driven (${p.kmDriven?.toLocaleString('en-IN')})`, value: `−₹${p.kmDepreciation.toLocaleString('en-IN')}`,    type: 'neg'    },
    { label: '1st Owner Bonus',  value: p.ownerBonus > 0 ? `+₹${p.ownerBonus.toLocaleString('en-IN')}` : '₹0', type: p.ownerBonus > 0 ? 'pos' : 'normal' },
    { label: 'Market Demand',    value: `+₹${p.marketDemand.toLocaleString('en-IN')}`, type: 'pos' },
    ...(p.notRunningPenalty  > 0 ? [{ label: 'Not Running Condition', value: `−₹${p.notRunningPenalty.toLocaleString('en-IN')}`,  type: 'neg' }] : []),
    ...(p.missingPartPenalty > 0 ? [{ label: 'Missing Parts Penalty', value: `−₹${p.missingPartPenalty.toLocaleString('en-IN')}`, type: 'neg' }] : []),
  ];

  const handleSaleNow = async () => {
    setLoading(true);
    try {
      // ✅ axios api.put
      const res = await api.put(`/car/approve-car-for-sale/${rcNumber}`, {
        price: p.fixedPrice,
      });

      if (res.data.success) {
        showToast('Car approved for sale!', 'success');
        onSave({ priceData: p });
        setTimeout(() => onNext(res.data.data), 800);
      } else {
        showToast(res.data.message || 'Failed to approve car', 'error');
      }
    } catch (err) {
      console.log('Approve Car Error:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast {...toast} />
      <div style={{ animation: 'fadeUp 0.32s ease' }}>
        {/* Price hero */}
        <div style={{ background: `linear-gradient(145deg, #0A2E17 0%, ${C.greenDark} 50%, #1356CC 100%)`, borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -50, right: -40 }} />
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Estimated Selling Price</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.white, letterSpacing: -1 }}>{formatted}</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 14px', margin: '10px 0 16px', fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            Based on current market data · Real-time
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.18)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${meterW}%`, background: '#6FD48A', borderRadius: 8, transition: 'width 0.9s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>₹2,00,000</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>₹5,00,000</span>
          </div>
        </div>

        <div className="section-card">
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Price Breakdown</div>
          {breakdown.map((b, i) => (
            <div key={i} className="breakdown-row">
              <span className="breakdown-label">{b.label}</span>
              <span className={`breakdown-val ${b.type === 'pos' ? 'breakdown-pos' : b.type === 'neg' ? 'breakdown-neg' : ''}`}>{b.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[['24 hrs', 'Avg selling time'], ['₹0', 'Zero commission'], ['100%', 'Secure payment']].map(([h, s]) => (
            <div key={h} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.greenDark }}>{h}</div>
              <div style={{ fontSize: 10, color: C.textSoft, marginTop: 3, lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={handleSaleNow} disabled={loading}>
          {loading
            ? <><Spinner /> Processing…</>
            : <>List Car for Sale <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
          }
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — SUCCESS
// ─────────────────────────────────────────────────────────────────────────────
function StepSuccess({ rcNumber, carDetail, onGoHome }) {
  const carName = carDetail ? `${carDetail.make || ''} ${carDetail.model || ''}`.trim() || 'Your Car' : 'Your Car';
  const details = [
    ['Car',             carName],
    ['RC Number',       rcNumber || carDetail?.rcNumber || 'N/A'],
    ['Estimated Price', `₹${carDetail.price}`],
    ['Status',         'Under Review'],
    ['Request ID',     carDetail?._id || 'N/A'],
  ];

  return (
    <div style={{ textAlign: 'center', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: C.greenLight, border: `3px solid ${C.greenMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scaleIn 0.5s cubic-bezier(.3,1.4,.5,1)' }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
          <polyline points="20,6 9,17 4,12" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="30" strokeDashoffset="30"
            style={{ animation: 'checkDraw 0.6s ease 0.4s forwards' }}
          />
        </svg>
      </div>

      <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>Listing Submitted! 🎉</div>
      <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.65, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
        Your vehicle request has been successfully submitted. Our team member will contact you shortly.
      </div>

      <div style={{ background: C.bg, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 24, textAlign: 'left' }}>
        {details.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < details.length - 1 ? `1px solid ${C.border}` : 'none', gap: 12 }}>
            <span style={{ fontSize: 13, color: C.textSoft }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textAlign: 'right', flex: 1 }}>{v}</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onGoHome} style={{ marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Go to Home
      </button>
      <button className="btn-ghost" onClick={onGoListing}>View My Listings</button>
      <div style={{ fontSize: 11, color: C.textSoft, marginTop: 20 }}>Bharat Scrap v1.0.0 · Made with ❤️ in India</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const STEP_TITLES = ['Enter RC Number', 'Car Details', 'Car Condition', 'Price Result', 'All Done!'];
const TOTAL_STEPS = 5;

export default function CarListingPage() {
  const [step,     setStep]     = useState(1);
  const [progress, setProgress] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setProgress(saved);
      if (saved.step && saved.step < 5) setStep(saved.step);
    }
    setHydrated(true);
  }, []);

  const saveField = useCallback((fields) => {
    setProgress(prev => {
      const next = { ...prev, ...fields };
      saveProgress(next);
      return next;
    });
  }, []);

  const goToStep = (n) => {
    setStep(n);
    setProgress(prev => { const next = { ...prev, step: n }; saveProgress(next); return next; });
  };

  if (!hydrated) return null;

  const shell = (children, canBack) => (
    <div style={{ minHeight: '100vh', background: '#F0F4F0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <GlobalStyles />
      <PageHeader
        title={STEP_TITLES[step - 1]}
        onBack={canBack ? () => goToStep(step - 1) : null}
        step={step}
        totalSteps={TOTAL_STEPS}
      />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 48px' }}>
        {children}
      </div>
    </div>
  );

  if (step === 1) return shell(
    <StepRCInput
      savedData={progress}
      onSave={saveField}
      onNext={(carData) => { saveField({ carData }); goToStep(2); }}
    />, false
  );

  if (step === 2) return shell(
    <StepCarDetails
      carData={progress.carData}
      rcNumber={progress.rcNum}
      onBack={() => goToStep(1)}
      onNext={() => goToStep(3)}
    />, true
  );

  if (step === 3) return shell(
    <StepConditionForm
      rcNumber={progress.rcNum}
      carData={progress.carData}
      savedData={progress}
      onSave={saveField}
      onBack={() => goToStep(2)}
      onNext={(updatedCar) => { saveField({ carData: { ...progress.carData, ...updatedCar } }); goToStep(4); }}
    />, true
  );

  if (step === 4) return shell(
    <StepPriceResult
      rcNumber={progress.rcNum}
      carDetail={progress.carData}
      onSave={saveField}
      onNext={(approvedData) => { saveField({ approvedData }); goToStep(5); }}
    />, true
  );

  if (step === 5) return shell(
    <StepSuccess
      rcNumber={progress.rcNum}
      carDetail={progress.approvedData || progress.carData}
      onGoHome={() => { clearProgress(); window.location.href = '/'; }}
      onGoListing={() => { clearProgress(); window.location.href = '/history'; }}
    />, false
  );
}