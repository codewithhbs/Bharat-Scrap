'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS = {
    processing: { color: '#F05A28', dim: 'rgba(240,90,40,0.08)', border: 'rgba(240,90,40,0.2)', label: 'Assigned', icon: 'clock' },
    en_route: { color: '#2563EB', dim: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)', label: 'En Route', icon: 'map' },
    inspecting: { color: '#D97706', dim: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', label: 'Inspecting', icon: 'eye' },
    picked_up: { color: '#16A34A', dim: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', label: 'Picked Up', icon: 'check' },
    en_route_to_garage: { color: '#2563EB', dim: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)', label: 'To Garage', icon: 'truck' },
    at_garage: { color: '#7C3AED', dim: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', label: 'At Garage', icon: 'pin' },
    sold: { color: '#16A34A', dim: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', label: 'Sold', icon: 'check' },
    cancelled: { color: '#DC2626', dim: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)', label: 'Cancelled', icon: 'x' },
};

const ACTIVE_STATUSES = ['processing', 'en_route', 'inspecting', 'picked_up', 'en_route_to_garage', 'at_garage'];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const handleCall = (phone) => phone && window.open(`tel:${phone}`);
const handleNavMap = (address) => address && window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 👋';
    return 'Good Evening 🌙';
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:           #F0F2F8;
      --surface:      #FFFFFF;
      --card:         #FFFFFF;
      --card-border:  #E4E8F0;
      --orange:       #F05A28;
      --orange-light: #FF7A4D;
      --orange-dim:   rgba(240,90,40,0.08);
      --orange-border:rgba(240,90,40,0.2);
      --green:        #16A34A;
      --green-dim:    rgba(22,163,74,0.08);
      --green-border: rgba(22,163,74,0.2);
      --yellow:       #D97706;
      --yellow-dim:   rgba(217,119,6,0.08);
      --red:          #DC2626;
      --red-dim:      rgba(220,38,38,0.08);
      --blue:         #2563EB;
      --blue-dim:     rgba(37,99,235,0.08);
      --purple:       #7C3AED;
      --purple-dim:   rgba(124,58,237,0.08);
      --purple-border:rgba(124,58,237,0.2);
      --text:         #111827;
      --text-sub:     #6B7280;
      --text-muted:   #9CA3AF;
      --divider:      #E9ECF3;
      --font-head:    'Sora', sans-serif;
      --font-body:    'DM Sans', sans-serif;
    }

    body { font-family: var(--font-body); background: var(--bg); color: var(--text); }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar       { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

    /* ── Animations ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideDown{ from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes shimmer  { from{background-position:-200% 0} to{background-position:200% 0} }
    @keyframes pop      { 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }
    @keyframes modalIn  { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

    /* ── Root layout ── */
    .cm-root { min-height: 100vh; background: var(--bg); }

    /* ── Header ── */
    .cm-header {
      background: #204325;
      padding: 28px 24px 32px;
      position: relative;
      overflow: hidden;
    }
    .cm-header::before {
      content:''; position:absolute; top:-60px; right:-60px;
      width:220px; height:220px; border-radius:50%;
      background:rgba(255,255,255,0.1);
    }
    .cm-header::after {
      content:''; position:absolute; top:20px; right:60px;
      width:110px; height:110px; border-radius:50%;
      background:rgba(255,255,255,0.07);
    }
    .cm-header-row   { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; position:relative; z-index:1; }
    .cm-greet        { font-family:var(--font-body); font-size:12px; color:rgba(255,255,255,0.7); font-weight:600; margin-bottom:4px; }
    .cm-name         { font-family:var(--font-head); font-size:24px; font-weight:900; color:#fff; letter-spacing:-0.6px; margin-bottom:8px; }
    .cm-role-tag     { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3); padding:3px 10px; border-radius:20px; font-size:9px; font-weight:800; color:#fff; letter-spacing:0.8px; text-transform:uppercase; }
    .cm-avatar       { width:50px; height:50px; border-radius:16px; background:rgba(255,255,255,0.22); border:1.5px solid rgba(255,255,255,0.38); display:flex; align-items:center; justify-content:center; font-family:var(--font-head); font-size:22px; font-weight:900; color:#fff; flex-shrink:0; }

    /* ── Stats row ── */
    .cm-stats        { display:flex; gap:8px; position:relative; z-index:1; }
    .cm-stat-tile    { flex:1; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.28); border-radius:14px; padding:12px 8px; text-align:center; }
    .cm-stat-val     { font-family:var(--font-head); font-size:24px; font-weight:900; color:#fff; letter-spacing:-0.5px; display:block; }
    .cm-stat-lbl     { font-size:9px; color:rgba(255,255,255,0.65); font-weight:700; margin-top:2px; letter-spacing:0.8px; text-transform:uppercase; display:block; }

    /* ── Body ── */
    .cm-body { max-width: 680px; margin: 0 auto; padding: 20px 16px 60px; }

    /* ── Section heading ── */
    .cm-sec-head  { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
    .cm-sec-dot   { width:8px; height:8px; border-radius:50%; background:var(--orange); flex-shrink:0; }
    .cm-sec-title { font-family:var(--font-head); font-size:13px; font-weight:800; color:var(--text); letter-spacing:0.2px; }
    .cm-see-all   { margin-left:auto; font-size:11px; font-weight:600; color:var(--orange); cursor:pointer; text-decoration:none; }
    .cm-see-all:hover { text-decoration:underline; }

    /* ── Idle / Empty states ── */
    .cm-idle {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      gap:8px; background:var(--card); border-radius:20px;
      border:1.5px dashed var(--card-border); padding:40px 24px; text-align:center;
      margin-bottom:16px; animation:fadeUp .3s ease;
    }
    .cm-idle-icon  { width:56px; height:56px; border-radius:18px; background:var(--bg); display:flex; align-items:center; justify-content:center; margin-bottom:4px; font-size:28px; }
    .cm-idle-title { font-family:var(--font-head); font-size:16px; font-weight:800; color:var(--text); }
    .cm-idle-sub   { font-size:12px; color:var(--text-muted); max-width:240px; line-height:1.6; }

    .cm-empty      { display:flex; flex-direction:column; align-items:center; gap:10px; padding:48px 0; text-align:center; }
    .cm-empty-title{ font-family:var(--font-head); font-size:15px; font-weight:800; color:var(--text); }
    .cm-empty-sub  { font-size:12px; color:var(--text-muted); line-height:1.6; }

    /* ── Loading ── */
    .cm-loading    { display:flex; align-items:center; justify-content:center; gap:10px; padding:48px; }
    .cm-loading-text{ font-size:13px; color:var(--text-sub); }
    .cm-spinner    { width:18px; height:18px; border:2.5px solid var(--card-border); border-top-color:var(--orange); border-radius:50%; animation:spin .7s linear infinite; flex-shrink:0; }

    /* ── Toast ── */
    .cm-toast {
      position:fixed; top:20px; left:50%; transform:translateX(-50%);
      z-index:9999; display:flex; align-items:center; gap:10px;
      padding:13px 20px; border-radius:14px; font-family:var(--font-head);
      font-size:13px; font-weight:700; max-width:340px; width:90%;
      box-shadow:0 8px 32px rgba(0,0,0,0.15); animation:slideDown .28s ease;
      pointer-events:none;
    }
    .cm-toast.success { background:#0A2E17; color:#6FD48A; border:1px solid rgba(111,212,138,0.22); }
    .cm-toast.error   { background:#DC2626; color:#fff; }
    .cm-toast.info    { background:#1E3A5F; color:#fff; }

    /* ── Badge ── */
    .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; border-width:1px; border-style:solid; white-space:nowrap; }
    .badge-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
    .badge-text { font-size:10px; font-weight:700; letter-spacing:0.5px; font-family:var(--font-head); }

    /* ── Active Job Card ── */
    .aj-card { border-radius:18px; overflow:hidden; border:1px solid var(--card-border); background:var(--card); margin-bottom:16px; box-shadow:0 2px 16px rgba(0,0,0,0.06); animation:fadeUp .35s ease; }
    .aj-accent-bar { height:3px; width:100%; }
    .aj-inner { padding:16px; }
    .aj-head  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .aj-tag   { font-size:9px; font-weight:800; color:var(--text-muted); letter-spacing:1.5px; margin-bottom:5px; font-family:var(--font-head); }
    .aj-carname { font-family:var(--font-head); font-size:20px; font-weight:900; color:var(--text); letter-spacing:-0.5px; margin-bottom:2px; }
    .aj-plate { font-size:11px; color:var(--text-sub); }
    .aj-divider { height:1px; background:var(--divider); margin-bottom:14px; }

    .aj-row   { display:flex; align-items:flex-start; gap:10px; margin-bottom:12px; }
    .aj-icon-bg { width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .aj-row-label { font-size:9px; color:var(--text-muted); font-weight:600; letter-spacing:0.5px; margin-bottom:2px; text-transform:uppercase; }
    .aj-row-val   { font-size:12px; color:var(--text); font-weight:600; line-height:1.5; }

    .aj-chips { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
    .aj-chip  { background:var(--bg); border:1px solid var(--divider); padding:3px 10px; border-radius:20px; font-size:10px; color:var(--text-sub); font-weight:600; }

    /* Steps / inspecting */
    .aj-steps-wrap  { border-top:1px solid var(--divider); padding-top:14px; display:flex; flex-direction:column; gap:9px; }
    .aj-steps-head  { font-size:11px; font-weight:700; color:var(--text-muted); letter-spacing:0.6px; text-transform:uppercase; margin-bottom:4px; font-family:var(--font-head); }
    .aj-step-row    { display:flex; align-items:center; gap:10px; background:var(--bg); border-radius:14px; padding:12px; border:1px solid var(--card-border); cursor:pointer; transition:all .18s; }
    .aj-step-row:hover { border-color:rgba(240,90,40,0.3); background:#fdf6f3; }
    .aj-step-row.done { border-color:var(--green-border); background:rgba(22,163,74,0.04); }
    .aj-step-num    { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:11px; font-weight:900; color:#fff; font-family:var(--font-head); }
    .aj-step-icon   { width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; border-width:1px; border-style:solid; flex-shrink:0; }
    .aj-step-label  { font-size:13px; font-weight:700; color:var(--text); margin-bottom:2px; font-family:var(--font-head); }
    .aj-step-sub    { font-size:10px; color:var(--text-sub); }

    .aj-confirm-btn {
      display:flex; align-items:center; justify-content:center; gap:8px;
      padding:13px; border-radius:14px; background:var(--green); border:none;
      font-family:var(--font-head); font-size:14px; font-weight:800; color:#fff;
      cursor:pointer; transition:all .18s; margin-top:2px; width:100%;
    }
    .aj-confirm-btn:hover:not(:disabled) { background:#15803D; transform:translateY(-1px); }
    .aj-confirm-btn.locked { background:var(--bg); border:1.5px solid var(--card-border); color:var(--text-muted); cursor:default; }
    .aj-lock-hint { font-size:10px; color:var(--text-muted); text-align:center; font-style:italic; }

    .aj-garage-box { display:flex; align-items:center; gap:8px; background:var(--green-dim); border:1px solid var(--green-border); border-radius:12px; padding:12px; margin-bottom:4px; font-size:13px; font-weight:600; color:var(--green); }

    .aj-actions { display:flex; gap:8px; }
    .aj-nav-btn { display:flex; align-items:center; gap:5px; padding:10px 13px; border-radius:12px; border:1px solid rgba(37,99,235,0.3); background:var(--blue-dim); font-family:var(--font-head); font-size:12px; font-weight:700; color:var(--blue); cursor:pointer; white-space:nowrap; transition:all .18s; }
    .aj-nav-btn:hover { background:rgba(37,99,235,0.14); }
    .aj-action-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:12px; border-radius:12px; border:none; font-family:var(--font-head); font-size:13px; font-weight:800; color:#fff; cursor:pointer; transition:all .18s; }
    .aj-action-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }

    .aj-call-btn { display:flex; align-items:center; gap:4px; padding:5px 10px; border-radius:20px; border-width:1px; border-style:solid; font-size:11px; font-weight:700; cursor:pointer; background:transparent; white-space:nowrap; transition:opacity .18s; }
    .aj-call-btn:hover { opacity:.75; }

    /* ── Job List Item ── */
    .ji-wrap  { display:flex; align-items:center; gap:11px; background:var(--card); border-radius:16px; padding:13px 13px 13px 16px; border:1px solid var(--card-border); position:relative; overflow:hidden; cursor:pointer; transition:all .18s; margin-bottom:9px; }
    .ji-wrap:hover { border-color:rgba(240,90,40,0.3); box-shadow:0 2px 12px rgba(0,0,0,0.08); transform:translateY(-1px); }
    .ji-accent { position:absolute; left:0; top:10px; bottom:10px; width:3px; border-radius:2px; }
    .ji-icon-bg { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .ji-body  { flex:1; min-width:0; }
    .ji-name  { font-family:var(--font-head); font-size:13px; font-weight:700; color:var(--text); letter-spacing:-0.2px; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ji-meta  { font-size:10px; color:var(--text-sub); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ji-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }

    /* ── Inspection Modal ── */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
    .modal-sheet   { background:var(--card); border-radius:28px 28px 0 0; width:100%; max-width:640px; padding:0 20px 36px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; animation:modalIn .3s ease; }
    .modal-handle  { width:40px; height:4px; border-radius:2px; background:var(--divider); margin:12px auto 8px; flex-shrink:0; }
    .modal-header  { display:flex; justify-content:space-between; align-items:flex-start; padding:16px 0; flex-shrink:0; }
    .modal-title   { font-family:var(--font-head); font-size:17px; font-weight:800; color:var(--text); letter-spacing:-0.3px; }
    .modal-sub     { font-size:12px; color:var(--text-sub); margin-top:3px; }
    .modal-close   { width:32px; height:32px; border-radius:10px; background:var(--bg); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
    .modal-close:hover { background:var(--divider); }
    .modal-scroll  { overflow-y:auto; flex:1; padding-bottom:8px; }

    .modal-sec-head { display:flex; align-items:center; gap:7px; margin-bottom:10px; }
    .modal-sec-dot  { width:7px; height:7px; border-radius:50%; }
    .modal-sec-title{ font-size:11px; font-weight:700; color:var(--text-sub); letter-spacing:0.5px; text-transform:uppercase; font-family:var(--font-head); }

    .modal-reupload-divider { display:flex; align-items:center; gap:10px; margin:16px 0; }
    .modal-divider-line     { flex:1; height:1px; background:var(--divider); }
    .modal-divider-text     { font-size:10px; color:var(--text-muted); font-weight:600; }

    .modal-progress { display:flex; align-items:center; gap:5px; margin-bottom:12px; }
    .modal-prog-dot { height:4px; border-radius:3px; transition:all .2s; }
    .modal-prog-text{ font-size:11px; color:var(--text-sub); font-weight:600; margin-left:6px; }

    .img-grid  { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:10px; }
    .img-slot  { aspect-ratio:1; border-radius:12px; overflow:hidden; position:relative; }
    .img-slot img { width:100%; height:100%; object-fit:cover; display:block; }
    .img-del   { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:50%; background:rgba(220,38,38,0.9); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .img-num   { position:absolute; bottom:5px; left:5px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:9px; color:#fff; font-weight:700; }
    .img-add   { aspect-ratio:1; border-radius:12px; border:1.5px dashed var(--card-border); background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; cursor:pointer; transition:all .18s; }
    .img-add:hover { border-color:var(--orange); background:var(--orange-dim); }
    .img-add-text { font-size:10px; color:var(--text-muted); font-weight:600; }

    .modal-actions { display:flex; gap:10px; margin-top:16px; flex-shrink:0; }
    .modal-cam-btn { display:flex; align-items:center; gap:7px; padding:12px 16px; border-radius:14px; border:1.5px solid rgba(37,99,235,0.25); background:var(--blue-dim); font-family:var(--font-head); font-size:13px; font-weight:700; color:var(--blue); cursor:pointer; transition:all .18s; white-space:nowrap; }
    .modal-cam-btn:hover { background:rgba(37,99,235,0.14); }
    .modal-up-btn  { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:14px; border-radius:14px; background:var(--orange); border:none; font-family:var(--font-head); font-size:13px; font-weight:800; color:#fff; cursor:pointer; transition:all .18s; }
    .modal-up-btn:hover:not(:disabled) { background:var(--orange-light); }
    .modal-up-btn:disabled { opacity:.5; cursor:not-allowed; }

    .loading-row { display:flex; align-items:center; gap:10px; padding:16px; justify-content:center; }

    /* ── Payment Modal ── */
    .pm-autofill { display:flex; align-items:center; gap:7px; background:var(--green-dim); border:1px solid var(--green-border); border-radius:10px; padding:10px 13px; margin-bottom:16px; font-size:11px; color:var(--green); font-weight:600; }
    .pm-tabs     { display:flex; gap:4px; background:var(--bg); border-radius:12px; padding:4px; margin-bottom:18px; }
    .pm-tab      { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:9px; border:none; background:transparent; font-family:var(--font-head); font-size:13px; font-weight:600; color:var(--text-sub); cursor:pointer; transition:all .18s; }
    .pm-tab.active { background:var(--card); box-shadow:0 1px 4px rgba(0,0,0,0.08); color:var(--orange); font-weight:800; }
    .pm-field    { margin-bottom:14px; }
    .pm-label    { font-size:11px; font-weight:700; color:var(--text-sub); letter-spacing:0.3px; margin-bottom:6px; display:block; font-family:var(--font-head); }
    .pm-input    { width:100%; background:var(--bg); border:1.5px solid var(--card-border); border-radius:12px; padding:12px 14px; font-size:14px; color:var(--text); font-weight:500; outline:none; transition:border-color .18s; font-family:var(--font-body); }
    .pm-input:focus { border-color:var(--orange); background:#fff; }
    .pm-submit   { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:15px; border-radius:14px; background:var(--green); border:none; font-family:var(--font-head); font-size:14px; font-weight:800; color:#fff; cursor:pointer; transition:all .18s; margin-top:8px; }
    .pm-submit:hover:not(:disabled) { background:#15803D; }
    .pm-submit:disabled { opacity:.5; cursor:not-allowed; }

    /* ── SVG icons util ── */
    .icon svg { display:block; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, color = '#111827', strokeWidth = 1.8 }) {
    const p = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
    const icons = {
        car: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" {...p} /><circle cx="7.5" cy="17.5" r="2.5" {...p} /><circle cx="16.5" cy="17.5" r="2.5" {...p} /></svg>,
        map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" {...p} /><path d="M8 2v16M16 6v16" {...p} /></svg>,
        clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" {...p} /><path d="M12 6v6l4 2" {...p} /></svg>,
        check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" {...p} /></svg>,
        eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></svg>,
        x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" {...p} /></svg>,
        chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" {...p} /></svg>,
        phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" {...p} /></svg>,
        navigate: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 11l19-9-9 19-2-8-8-2z" {...p} /></svg>,
        truck: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="1" y="3" width="15" height="13" rx="1" {...p} /><path d="M16 8h4l3 3v5h-7V8z" {...p} /><circle cx="5.5" cy="18.5" r="2.5" {...p} /><circle cx="18.5" cy="18.5" r="2.5" {...p} /></svg>,
        pin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" {...p} /><circle cx="12" cy="10" r="3" {...p} /></svg>,
        user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...p} /><circle cx="12" cy="7" r="4" {...p} /></svg>,
        camera: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" {...p} /><circle cx="12" cy="13" r="4" {...p} /></svg>,
        bank: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...p} /><path d="M9 22V12h6v10" {...p} /></svg>,
        upi: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" {...p} /><path d="M2 10h20" {...p} /></svg>,
        warning: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...p} /><path d="M12 9v4M12 17h.01" {...p} /></svg>,
        trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" {...p} /></svg>,
        plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" {...p} /></svg>,
        lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" {...p} /><path d="M7 11V7a5 5 0 0110 0v4" {...p} /></svg>,
        garage: <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...p} /><path d="M9 22V12h6v10M5 14h14" {...p} /></svg>,
    };
    return <span className="icon">{icons[name] || null}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ status }) {
    const cfg = STATUS[status] || STATUS.processing;
    return (
        <span className="badge" style={{ backgroundColor: cfg.dim, borderColor: cfg.border }}>
            <span className="badge-dot" style={{ backgroundColor: cfg.color }} />
            <span className="badge-text" style={{ color: cfg.color }}>{cfg.label}</span>
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'info' }) {
    if (!msg) return null;
    return (
        <div className={`cm-toast ${type}`}>
            {type === 'success' && <Icon name="check" size={16} color="#6FD48A" />}
            {type === 'error' && <Icon name="x" size={16} color="#fff" />}
            {msg}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSPECTION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function InspectionModal({ visible, job, onClose, onSuccess, showToast }) {
    const [newFiles, setNewFiles] = useState([]);    // { file, preview }
    const [existingImages, setExistingImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (visible && job) {
            setExistingImages((job.images || []).map(img => img.image));
            setNewFiles([]);
        }
    }, [visible, job?._id]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const slots = 5 - newFiles.length;
        const picked = files.slice(0, slots).map(file => ({ file, preview: URL.createObjectURL(file) }));
        setNewFiles(prev => [...prev, ...picked]);
        e.target.value = '';
    };

    const removeNew = (idx) => setNewFiles(prev => prev.filter((_, i) => i !== idx));

    const handleUpload = async () => {
        if (newFiles.length === 0) { showToast('Please add at least 1 photo'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            newFiles.forEach(({ file }) => formData.append('images', file, file.name));
            const res = await api.put(`/craneman/job/${job._id}/inspection-details`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.success) {
                showToast('Photos uploaded successfully ✓');
                setNewFiles([]);
                onSuccess();
            } else {
                showToast(res.data?.message || 'Upload failed');
            }
        } catch {
            showToast('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => { setNewFiles([]); setExistingImages([]); onClose(); };
    if (!visible) return null;

    const hasExisting = existingImages.length > 0;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                    <div>
                        <div className="modal-title">Vehicle Inspection Photos</div>
                        <div className="modal-sub">{hasExisting ? 'Previously uploaded photos shown below' : 'Upload clear photos of the vehicle (max 5)'}</div>
                    </div>
                    <button className="modal-close" onClick={handleClose}><Icon name="x" size={16} color="var(--text-sub)" /></button>
                </div>

                <div className="modal-scroll">
                    {/* Existing images */}
                    {hasExisting && (
                        <div style={{ marginBottom: 20 }}>
                            <div className="modal-sec-head">
                                <div className="modal-sec-dot" style={{ backgroundColor: 'var(--green)' }} />
                                <span className="modal-sec-title">Previously Uploaded ({existingImages.length})</span>
                            </div>
                            <div className="img-grid">
                                {existingImages.map((url, idx) => (
                                    <div key={idx} className="img-slot">
                                        <img src={url} alt={`existing-${idx}`} />
                                        <div className="img-num"><span>{idx + 1}</span></div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-reupload-divider">
                                <div className="modal-divider-line" />
                                <span className="modal-divider-text">Re-upload to replace</span>
                                <div className="modal-divider-line" />
                            </div>
                        </div>
                    )}

                    {/* New images */}
                    <div>
                        {hasExisting && (
                            <div className="modal-sec-head">
                                <div className="modal-sec-dot" style={{ backgroundColor: 'var(--orange)' }} />
                                <span className="modal-sec-title">New Photos to Upload</span>
                            </div>
                        )}
                        <div className="modal-progress">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="modal-prog-dot" style={{ backgroundColor: n <= newFiles.length ? 'var(--orange)' : 'var(--divider)', width: n <= newFiles.length ? 20 : 8 }} />
                            ))}
                            <span className="modal-prog-text">{newFiles.length}/5 photos selected</span>
                        </div>
                        <div className="img-grid">
                            {newFiles.map(({ preview }, idx) => (
                                <div key={idx} className="img-slot">
                                    <img src={preview} alt={`new-${idx}`} />
                                    <button className="img-del" onClick={() => removeNew(idx)}><Icon name="trash" size={11} color="#fff" /></button>
                                    <div className="img-num"><span>{idx + 1}</span></div>
                                </div>
                            ))}
                            {newFiles.length < 5 && (
                                <div className="img-add" onClick={() => fileInputRef.current?.click()}>
                                    <Icon name="plus" size={22} color="var(--text-muted)" />
                                    <span className="img-add-text">Add Photo</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="modal-cam-btn" onClick={() => fileInputRef.current?.click()} disabled={newFiles.length >= 5}>
                        <Icon name="camera" size={16} color="var(--blue)" /> Gallery
                    </button>
                    <button className="modal-up-btn" onClick={handleUpload} disabled={newFiles.length === 0 || uploading}>
                        {uploading ? <span className="cm-spinner" style={{ borderTopColor: '#fff' }} /> : <Icon name="check" size={16} color="#fff" />}
                        <span>{uploading ? 'Uploading…' : hasExisting ? 'Replace Photos' : 'Submit Photos'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PaymentModal({ visible, job, user, onClose, onSuccess, showToast }) {
    const [tab, setTab] = useState('upi');
    const [submitting, setSubmitting] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');

    useEffect(() => {
        if (visible && user) {
            setUpiId(user.upiDetails?.upiId || '');
            setAccountNumber(user.bankDetails?.accountNumber || '');
            setIfscCode(user.bankDetails?.ifscCode || '');
            setBankName(user.bankDetails?.bankName || '');
            setAccountHolderName(user.bankDetails?.accountHolderName || '');
        }
    }, [visible, user]);

    const hasAutoFill = !!(user?.upiDetails?.upiId || user?.bankDetails?.accountNumber);
    const isValid = tab === 'upi'
        ? upiId.trim().length > 3
        : accountNumber.trim() && ifscCode.trim() && bankName.trim() && accountHolderName.trim();

    const handleSubmit = async () => {
        if (!isValid) { showToast('Please fill all required fields'); return; }
        setSubmitting(true);
        try {
            const body = {
                paymentMethod: tab,
                upiId: tab === 'upi' ? upiId.trim() : '',
                accountNumber: tab === 'bank' ? accountNumber.trim() : '',
                ifscCode: tab === 'bank' ? ifscCode.trim() : '',
                bankName: tab === 'bank' ? bankName.trim() : '',
                accountHolderName: tab === 'bank' ? accountHolderName.trim() : '',
            };
            const res = await api.put(`/craneman/car-payment-update/${job._id}`, body);
            if (res.data?.success) { showToast('Payment details saved ✓'); onSuccess(); }
            else showToast(res.data?.message || 'Failed to save');
        } catch { showToast('Something went wrong. Try again.'); }
        finally { setSubmitting(false); }
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-header">
                    <div>
                        <div className="modal-title">Payment Details</div>
                        <div className="modal-sub">Choose how you'd like to receive payment</div>
                    </div>
                    <button className="modal-close" onClick={onClose}><Icon name="x" size={16} color="var(--text-sub)" /></button>
                </div>

                {hasAutoFill && (
                    <div className="pm-autofill">
                        <Icon name="check" size={12} color="var(--green)" />
                        Pre-filled from your saved profile — edit if needed
                    </div>
                )}

                <div className="pm-tabs">
                    <button className={`pm-tab ${tab === 'upi' ? 'active' : ''}`} onClick={() => setTab('upi')}>
                        <Icon name="upi" size={14} color={tab === 'upi' ? 'var(--orange)' : 'var(--text-sub)'} /> UPI
                    </button>
                    <button className={`pm-tab ${tab === 'bank' ? 'active' : ''}`} onClick={() => setTab('bank')}>
                        <Icon name="bank" size={14} color={tab === 'bank' ? 'var(--orange)' : 'var(--text-sub)'} /> Bank Transfer
                    </button>
                </div>

                <div className="modal-scroll" style={{ maxHeight: 280 }}>
                    {tab === 'upi' ? (
                        <div className="pm-field">
                            <label className="pm-label">UPI ID *</label>
                            <input className="pm-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" autoCapitalize="none" />
                        </div>
                    ) : (
                        <>
                            <div className="pm-field">
                                <label className="pm-label">Account Holder Name *</label>
                                <input className="pm-input" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} placeholder="Full name as per bank" />
                            </div>
                            <div className="pm-field">
                                <label className="pm-label">Account Number *</label>
                                <input className="pm-input" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Enter account number" type="number" />
                            </div>
                            <div className="pm-field">
                                <label className="pm-label">IFSC Code *</label>
                                <input className="pm-input" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" />
                            </div>
                            <div className="pm-field">
                                <label className="pm-label">Bank Name *</label>
                                <input className="pm-input" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. State Bank of India" />
                            </div>
                        </>
                    )}
                </div>

                <button className="pm-submit" onClick={handleSubmit} disabled={!isValid || submitting}>
                    {submitting ? <span className="cm-spinner" style={{ borderTopColor: '#fff', width: 16, height: 16 }} /> : <Icon name="check" size={16} color="#fff" />}
                    <span>{submitting ? 'Saving…' : 'Save Payment Details'}</span>
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE JOB CARD
// ─────────────────────────────────────────────────────────────────────────────
function ActiveJobCard({ job, user, onNavigate, onUpdateStatus, showToast }) {
    const [showInspection, setShowInspection] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [imagesUploaded, setImagesUploaded] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);

    useEffect(() => {
        if (!job) return;
        setImagesUploaded(Array.isArray(job.images) && job.images.length > 0);
        const pd = job.paymentDetails || {};
        setPaymentDone(!!(pd.upiId?.trim() || pd.accountNumber?.trim() || pd.ifscCode?.trim() || pd.bankName?.trim() || pd.accountHolderName?.trim()));
    }, [job]);

    if (!job) return null;

    const cfg = STATUS[job.status] || STATUS.processing;
    const carName = `${job.carDetail?.make || ''} ${job.carDetail?.model || ''}`.trim() || 'Unknown Car';
    const isInspecting = job.status === 'inspecting';
    const isPickedUp = job.status === 'picked_up';
    const isEnRouteGarage = job.status === 'en_route_to_garage';
    const canConfirmPickup = imagesUploaded && paymentDone;

    const nextActions = {
        processing: [{ label: 'Start Journey to Pickup', status: 'en_route', icon: 'navigate', color: 'var(--blue)' }],
        en_route: [{ label: 'Reached — Start Inspection', status: 'inspecting', icon: 'eye', color: 'var(--yellow)' }],
        en_route_to_garage: [{ label: 'Reached Garage', status: 'at_garage', icon: 'garage', color: 'var(--purple)' }],
        at_garage: [{ label: 'Mark as Sold', status: 'sold', icon: 'check', color: 'var(--green)' }],
    };
    const actions = nextActions[job.status] || [];

    return (
        <>
            <div className="aj-card">
                <div className="aj-accent-bar" style={{ backgroundColor: cfg.color }} />
                <div className="aj-inner">

                    {/* Head */}
                    <div className="aj-head">
                        <div style={{ flex: 1, marginRight: 10 }}>
                            <div className="aj-tag">ACTIVE JOB</div>
                            <div className="aj-carname">{carName}</div>
                            <div className="aj-plate">{job.rcNumber || '—'} · {job.carDetail?.manufacturingYear || ''}</div>
                        </div>
                        <Badge status={job.status} />
                    </div>

                    <div className="aj-divider" />

                    {/* Owner */}
                    <div className="aj-row">
                        <div className="aj-icon-bg" style={{ backgroundColor: 'var(--orange-dim)' }}>
                            <Icon name="user" size={14} color="var(--orange)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="aj-row-label">Vehicle Owner</div>
                            <div className="aj-row-val">{job?.carDetail?.ownerName || 'N/A'}</div>
                        </div>
                        {job?.seller?.phone && (
                            <button className="aj-call-btn" style={{ borderColor: 'var(--green-border)', color: 'var(--green)' }} onClick={() => handleCall(job.seller.phone)}>
                                <Icon name="phone" size={13} color="var(--green)" /> Call
                            </button>
                        )}
                    </div>

                    {/* Address */}
                    <div className="aj-row">
                        <div className="aj-icon-bg" style={{ backgroundColor: 'var(--blue-dim)' }}>
                            <Icon name="pin" size={14} color="var(--blue)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="aj-row-label">Pickup Address</div>
                            <div className="aj-row-val">{job?.pickupLocation || 'Address not available'}</div>
                        </div>
                    </div>

                    {/* Chips */}
                    <div className="aj-chips">
                        {job.kmDriven && <span className="aj-chip">{Number(job.kmDriven).toLocaleString()} km</span>}
                        <span className="aj-chip">{job.carDetail?.fuelType || 'Petrol'}</span>
                        {job.carDetail?.transmission && <span className="aj-chip">{job.carDetail.transmission}</span>}
                    </div>

                    {/* Inspecting: 2-step */}
                    {isInspecting && (
                        <div className="aj-steps-wrap">
                            <div className="aj-steps-head">Complete to confirm pickup</div>

                            <div className={`aj-step-row ${imagesUploaded ? 'done' : ''}`} onClick={() => setShowInspection(true)}>
                                <div className="aj-step-num" style={{ backgroundColor: imagesUploaded ? 'var(--green)' : 'var(--orange)' }}>
                                    {imagesUploaded ? <Icon name="check" size={12} color="#fff" strokeWidth={2.5} /> : '1'}
                                </div>
                                <div className="aj-step-icon" style={{ backgroundColor: imagesUploaded ? 'var(--green-dim)' : 'var(--orange-dim)', borderColor: imagesUploaded ? 'var(--green-border)' : 'var(--orange-border)' }}>
                                    <Icon name="camera" size={16} color={imagesUploaded ? 'var(--green)' : 'var(--orange)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="aj-step-label" style={{ color: imagesUploaded ? 'var(--green)' : 'var(--text)' }}>{imagesUploaded ? 'Photos Uploaded' : 'Upload Vehicle Photos'}</div>
                                    <div className="aj-step-sub">{imagesUploaded ? 'Click to re-upload if needed' : 'Required — up to 5 photos'}</div>
                                </div>
                                <Icon name="chevron" size={14} color={imagesUploaded ? 'var(--green)' : 'var(--text-muted)'} />
                            </div>

                            <div className={`aj-step-row ${paymentDone ? 'done' : ''}`} onClick={() => setShowPayment(true)}>
                                <div className="aj-step-num" style={{ backgroundColor: paymentDone ? 'var(--green)' : 'var(--blue)' }}>
                                    {paymentDone ? <Icon name="check" size={12} color="#fff" strokeWidth={2.5} /> : '2'}
                                </div>
                                <div className="aj-step-icon" style={{ backgroundColor: paymentDone ? 'var(--green-dim)' : 'var(--blue-dim)', borderColor: paymentDone ? 'var(--green-border)' : 'rgba(37,99,235,0.2)' }}>
                                    <Icon name="upi" size={16} color={paymentDone ? 'var(--green)' : 'var(--blue)'} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="aj-step-label" style={{ color: paymentDone ? 'var(--green)' : 'var(--text)' }}>{paymentDone ? 'Payment Details Saved' : 'Add Payment Details'}</div>
                                    <div className="aj-step-sub">{paymentDone ? 'Click to update' : 'UPI or bank account'}</div>
                                </div>
                                <Icon name="chevron" size={14} color={paymentDone ? 'var(--green)' : 'var(--text-muted)'} />
                            </div>

                            <button className={`aj-confirm-btn ${!canConfirmPickup ? 'locked' : ''}`} onClick={() => canConfirmPickup && onUpdateStatus(job._id, 'picked_up')}>
                                <Icon name={canConfirmPickup ? 'truck' : 'lock'} size={15} color={canConfirmPickup ? '#fff' : 'var(--text-muted)'} />
                                Confirm Pickup
                            </button>
                            {!canConfirmPickup && (
                                <div className="aj-lock-hint">
                                    {!imagesUploaded && !paymentDone ? 'Complete both steps above to unlock'
                                        : !imagesUploaded ? 'Upload vehicle photos to unlock'
                                            : 'Save payment details to unlock'}
                                </div>
                            )}
                            <button className="aj-nav-btn" style={{ alignSelf: 'flex-start' }} onClick={onNavigate}>
                                <Icon name="navigate" size={14} color="var(--blue)" /> Open Directions
                            </button>
                        </div>
                    )}

                    {/* Picked up */}
                    {isPickedUp && (
                        <div className="aj-steps-wrap">
                            <div className="aj-garage-box">
                                <Icon name="check" size={15} color="var(--green)" /> Car has been picked up successfully!
                            </div>
                            <button className="aj-confirm-btn" style={{ backgroundColor: 'var(--blue)' }} onClick={() => onUpdateStatus(job._id, 'en_route_to_garage')}>
                                <Icon name="truck" size={15} color="#fff" /> Head to Garage
                            </button>
                        </div>
                    )}

                    {/* Other standard actions */}
                    {!isInspecting && !isPickedUp && actions.length > 0 && (
                        <div className="aj-actions">
                            {(job.status === 'processing' || job.status === 'en_route') && (
                                <button className="aj-nav-btn" onClick={onNavigate}>
                                    <Icon name="navigate" size={14} color="var(--blue)" /> Directions
                                </button>
                            )}
                            {actions.map(a => (
                                <button key={a.status} className="aj-action-btn" style={{ backgroundColor: a.color }} onClick={() => onUpdateStatus(job._id, a.status)}>
                                    <Icon name={a.icon} size={14} color="#fff" /> {a.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Garage directions */}
                    {isEnRouteGarage && job.garageLocation && (
                        <button className="aj-nav-btn" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => handleNavMap(job.garageLocation)}>
                            <Icon name="navigate" size={14} color="var(--blue)" /> Directions to Garage
                        </button>
                    )}
                </div>
            </div>

            <InspectionModal visible={showInspection} job={job} onClose={() => setShowInspection(false)} onSuccess={() => { setImagesUploaded(true); setShowInspection(false); }} showToast={showToast} />
            <PaymentModal visible={showPayment} job={job} user={user} onClose={() => setShowPayment(false)} onSuccess={() => { setPaymentDone(true); setShowPayment(false); }} showToast={showToast} />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB LIST ITEM
// ─────────────────────────────────────────────────────────────────────────────
function JobItem({ job, onPress }) {
    const cfg = STATUS[job.status] || STATUS.processing;
    const carName = `${job.carDetail?.make || ''} ${job.carDetail?.model || ''}`.trim() || 'Unknown Car';
    const year = job.carDetail?.manufacturingYear || '';
    return (
        <div className="ji-wrap" onClick={() => onPress(job._id)}>
            <div className="ji-accent" style={{ backgroundColor: cfg.color }} />
            <div className="ji-icon-bg" style={{ backgroundColor: cfg.dim }}>
                <Icon name="car" size={16} color={cfg.color} />
            </div>
            <div className="ji-body">
                <div className="ji-name">{carName} {year}</div>
                <div className="ji-meta">{job.rcNumber || '—'}  ·  {job?.carDetail?.ownerName || 'N/A'}</div>
            </div>
            <div className="ji-right">
                <Badge status={job.status} />
                <Icon name="chevron" size={13} color="var(--text-muted)" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
    const [user, setUser] = useState({});
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('info');

    const showToast = (msg, type = 'info') => {
        setToastMsg(msg); setToastType(type);
        setTimeout(() => setToastMsg(''), 2800);
    };

    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data?.success) setUser(res.data.user || {});
        } catch { }
    }, []);

    const fetchJobs = useCallback(async () => {
        try {
            const res = await api.get('/car/car-details-for-me');
            if (res.data?.success) setJobs(res.data.data || []);
            else showToast(res.data?.message || 'Failed to load jobs', 'error');
        } catch { showToast('Something went wrong. Please try again.', 'error'); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    const updateJobStatus = async (jobId, newStatus) => {
        try {
            const res = await api.patch(`/craneman/job/${jobId}/status`, { status: newStatus });
            if (res.data?.success) {
                setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
                showToast(`Status updated to ${STATUS[newStatus]?.label || newStatus}`, 'success');
            } else showToast(res.data?.message || 'Failed to update status', 'error');
        } catch { showToast('Update failed. Try again.', 'error'); }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchUser(), fetchJobs()]);
    };

    useEffect(() => { fetchUser(); fetchJobs(); }, []);

    const activeJob = jobs.find(j => ACTIVE_STATUSES.includes(j.status));
    const recentJobs = jobs.filter(j => j._id !== activeJob?._id).slice(0, 5);
    const totalJobs = jobs.length;
    const doneCount = jobs.filter(j => j.status === 'sold').length;
    const activeCount = jobs.filter(j => ACTIVE_STATUSES.includes(j.status)).length;

    return (
        <>
            <GlobalStyles />
            <div className="cm-root">
                {/* Header */}
                {/* <div className="cm-header">
                    <div className="cm-header-row">
                        <div>
                            <div className="cm-greet">{greeting()}</div>
                            <div className="cm-name">{user?.name || 'Crane Operator'}</div>
                            <div className="cm-role-tag">
                                <Icon name="truck" size={10} color="#fff" strokeWidth={2} /> Crane Specialist
                            </div>
                        </div>
                        <div className="cm-avatar">{(user?.name || 'C').charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="cm-stats">
                        <div className="cm-stat-tile"><span className="cm-stat-val">{totalJobs}</span><span className="cm-stat-lbl">Total</span></div>
                        <div className="cm-stat-tile"><span className="cm-stat-val">{activeCount}</span><span className="cm-stat-lbl">Active</span></div>
                        <div className="cm-stat-tile"><span className="cm-stat-val">{doneCount}</span><span className="cm-stat-lbl">Sold</span></div>
                    </div>
                </div> */}

                {/* Body */}
                <div className="cm-body">
                    {/* Refresh button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                        <button onClick={onRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}>
                            <span style={{ display: 'inline-block', animation: refreshing ? 'spin .7s linear infinite' : 'none' }}><Icon name="map" size={14} color="var(--text-sub)" /></span>
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="cm-loading">
                            <span className="cm-spinner" />
                            <span className="cm-loading-text">Loading your assignments…</span>
                        </div>
                    ) : activeJob ? (
                        <>
                            <div className="cm-sec-head">
                                <div className="cm-sec-dot" />
                                <span className="cm-sec-title">Active Assignment</span>
                            </div>
                            <ActiveJobCard
                                job={activeJob}
                                user={user}
                                onNavigate={() => handleNavMap(activeJob.pickupLocation || '')}
                                onUpdateStatus={updateJobStatus}
                                showToast={showToast}
                            />
                        </>
                    ) : (
                        <div className="cm-idle">
                            <div className="cm-idle-icon">⏳</div>
                            <div className="cm-idle-title">No Active Assignment</div>
                            <div className="cm-idle-sub">You'll be notified when a new job is assigned.</div>
                        </div>
                    )}

                    {recentJobs.length > 0 && (
                        <>
                            <div className="cm-sec-head" style={{ marginTop: 6 }}>
                                <div className="cm-sec-dot" style={{ backgroundColor: 'var(--text-muted)' }} />
                                <span className="cm-sec-title">Recent Jobs</span>
                                {jobs.length > 6 && <a className="cm-see-all" href="/jobs">See all →</a>}
                            </div>
                            {recentJobs.map(job => (
                                <JobItem key={job._id} job={job} onPress={(id) => window.location.href = `/history/${id}`} />
                            ))}
                        </>
                    )}

                    {!loading && jobs.length === 0 && (
                        <div className="cm-empty">
                            <Icon name="warning" size={32} color="var(--text-muted)" />
                            <div className="cm-empty-title">No Jobs Yet</div>
                            <div className="cm-empty-sub">Your assigned pickups will appear here.</div>
                        </div>
                    )}
                </div>
            </div>

            <Toast msg={toastMsg} type={toastType} />
        </>
    );
}