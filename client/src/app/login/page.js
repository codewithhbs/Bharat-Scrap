'use client';

import { useState, useRef } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.bharatscrapfacilities.com/api';

/* ─── Shared style tokens ─── */
const C = {
  green:       '#246DB2',
  greenDark:   '#246DB2',
  greenLight:  '#d6ebff',
  greenMid:    '#a1d2ff',
  text:        '#111827',
  textMid:     '#4B5563',
  textSoft:    '#9CA3AF',
  border:      '#E5E7EB',
  bg:          '#F9FAFB',
  white:       '#FFFFFF',
  errorBg:     '#FEF2F2',
  errorText:   '#DC2626',
  errorBorder: '#FCA5A5',
};

const styles = {
  /* Page shell */
  page: {
    minHeight: '80vh',
    background: C.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },

  /* Toast */
  toastBase: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 700,
    maxWidth: '340px',
    width: '90%',
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    animation: 'slideDown 0.3s ease',
  },
  toastSuccess: { background: '#0A2E17', color: '#6FD48A', border: '1px solid rgba(111,212,138,0.25)' },
  toastError:   { background: '#DC2626', color: C.white },
  toastInfo:    { background: '#1E3A5F', color: C.white },

  /* Hero header */
  hero: {
    background: 'linear-gradient(145deg, #04A03F 0%, #027830 60%, #025525 100%)',
    padding: '60px 24px 52px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDot: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none',
  },
  heroInner: { maxWidth: '380px', margin: '0 auto', position: 'relative', zIndex: 1 },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '20px',
    padding: '4px 12px',
    marginBottom: '16px',
  },
  heroBadgeDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: '#B8F5CC',
    boxShadow: '0 0 6px #B8F5CC',
  },
  heroBadgeText: { fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
  heroTitle: { display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '10px' },
  heroTitleWhite: { fontSize: '34px', fontWeight: 900, color: C.white, letterSpacing: '-0.5px', lineHeight: 1 },
  heroTitleGold: { fontSize: '34px', fontWeight: 900, color: '#C8F5D0', letterSpacing: '-0.5px', lineHeight: 1 },
  heroSub: { fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontWeight: 400 },

  /* Form card */
  card: {
    // flex: 1,
    background: C.white,
    borderRadius: '28px 28px 0 0',
    // marginTop: '-24px',
    padding: '32px 20px 40px',
    maxWidth: '420px',
    width: '100%',
    // margin: '-24px auto 0',
    boxShadow: '0 -4px 30px rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 2,
  },
  cardHandle: {
    width: '40px', height: '4px',
    background: '#E5E7EB',
    borderRadius: '4px',
    margin: '0 auto 28px',
  },

  /* Labels */
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 800,
    color: C.textMid,
    marginBottom: '8px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  /* Phone row */
  phoneRow: { display: 'flex', gap: '8px', marginBottom: '0' },
  countryBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: C.bg,
    border: `1.5px solid ${C.border}`,
    borderRadius: '14px',
    padding: '0 14px',
    height: '50px',
    minWidth: '82px',
    flexShrink: 0,
  },
  countryCode: { fontSize: '13px', fontWeight: 800, color: C.text },
  phoneInput: {
    flex: 1,
    background: C.bg,
    border: `1.5px solid ${C.border}`,
    borderRadius: '14px',
    padding: '0 16px',
    height: '50px',
    fontSize: '15px',
    color: C.text,
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
  phoneInputFocus: {
    borderColor: C.green,
    background: C.white,
    boxShadow: `0 0 0 3px ${C.greenLight}`,
  },
  phoneInputError: {
    borderColor: C.errorText,
    background: C.errorBg,
  },

  /* Error box */
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: C.errorBg,
    border: `1px solid ${C.errorBorder}`,
    borderRadius: '10px',
    padding: '10px 12px',
    marginTop: '8px',
  },
  errorText: { fontSize: '12px', color: C.errorText, fontWeight: 600 },

  /* Primary button */
  btn: {
    width: '100%',
    background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
    border: 'none',
    borderRadius: '14px',
    padding: '0 20px',
    height: '52px',
    color: C.white,
    fontSize: '14px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: `0 4px 20px #c1e1ff`,
    letterSpacing: '0.02em',
    fontFamily: 'inherit',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  /* OTP section */
  changeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: C.green,
    fontWeight: 700,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '20px',
    fontFamily: 'inherit',
  },
  otpInfo: { fontSize: '12px', color: C.textSoft, marginBottom: '16px', lineHeight: 1.5 },
  otpInfoBold: { fontWeight: 800, color: C.text },
  otpGrid: { display: 'flex', gap: '8px' },
  otpBox: {
    flex: 1,
    height: '54px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 900,
    borderRadius: '14px',
    border: `1.5px solid ${C.border}`,
    background: C.bg,
    color: C.text,
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  otpBoxFilled: {
    borderColor: C.green,
    background: C.greenLight,
    color: C.greenDark,
    boxShadow: `0 0 0 3px rgba(4,160,63,0.12)`,
  },

  /* Resend row */
  resendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    margin: '16px 0',
  },
  resendText: { fontSize: '12px', color: C.textSoft },
  resendBtn: {
    fontSize: '12px',
    color: C.green,
    fontWeight: 800,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },

  /* Divider */
  divider: { display: 'flex', alignItems: 'center', margin: '24px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#F3F4F6' },

  /* Terms */
  terms: {
    fontSize: '11px',
    color: C.textSoft,
    textAlign: 'center',
    lineHeight: 1.7,
    padding: '0 8px',
  },
  termsLink: { color: C.green, fontWeight: 700, textDecoration: 'none' },

  /* Feature pills */
  features: {
    display: 'flex',
    gap: '8px',
    marginTop: '24px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: C.greenLight,
    border: `1px solid ${C.greenMid}`,
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: 700,
    color: C.greenDark,
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 900,
    color: C.text,
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },
  sectionSub: {
    fontSize: '13px',
    color: C.textMid,
    marginBottom: '24px',
    lineHeight: 1.5,
  },
};

export default function Page() {
  const [phone, setPhone]           = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState({ msg: '', type: 'info' });
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [focusedOtp, setFocusedOtp] = useState(-1);
  const otpRefs = useRef([]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'info' }), 2800);
  };

  const validatePhone = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const sendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        showToast(`OTP sent to +91 ${phone}`, 'success');
      } else {
        showToast(data.message || 'Failed to send OTP', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.some((v) => !v)) { showToast('Please enter the complete OTP', 'error'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/auth/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.join(''), where: 'web' }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.accessToken && data.refreshToken) {
          localStorage.setItem('adpt_token', data.accessToken);
          localStorage.setItem('adpt_refresh_token', data.refreshToken);
          showToast('Login successful! Redirecting…', 'success');
          setTimeout(() => { window.location.href = '/'; }, 1200);
        } else {
          showToast('Login failed: Tokens not received', 'error');
        }
      } else {
        showToast(data.message || 'Invalid OTP', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    try {
      const res  = await fetch(`${BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      showToast(data.success ? 'OTP resent!' : (data.message || 'Failed to resend'), data.success ? 'success' : 'error');
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOTPChange = (val, idx) => {
    const cleaned = val.replace(/\D/g, '');
    const newOtp  = [...otp];
    newOtp[idx]   = cleaned.slice(-1);
    setOtp(newOtp);
    if (cleaned && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOTPKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const toastStyle = {
    ...styles.toastBase,
    ...(toast.type === 'success' ? styles.toastSuccess
      : toast.type === 'error'   ? styles.toastError
      : styles.toastInfo),
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #9CA3AF; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div style={toastStyle}>
          {toast.type === 'success' && (
            <svg style={{ flexShrink: 0 }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
          {toast.type === 'error' && (
            <svg style={{ flexShrink: 0 }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Hero */}
      {/* <div style={styles.hero}>
        <div style={{ ...styles.heroDot, width: 180, height: 180, top: -60, right: -50 }} />
        <div style={{ ...styles.heroDot, width: 100, height: 100, bottom: 10, left: -30 }} />
        <div style={{ ...styles.heroDot, width: 60, height: 60, top: 30, right: 80, background: 'rgba(255,255,255,0.04)' }} />

        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>
            <div style={styles.heroBadgeDot} />
            <span style={styles.heroBadgeText}>Trusted Scrap Partner</span>
          </div>
          <div style={styles.heroTitle}>
            <span style={styles.heroTitleWhite}>Bharat</span>
            <span style={{ ...styles.heroTitleGold, marginLeft: '6px' }}>Scrap</span>
          </div>
          <p style={styles.heroSub}>Apna purana vehicle bechen — best price guaranteed</p>
        </div>
      </div> */}

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.cardHandle} />

        {!otpSent ? (
          <div style={{ animation: 'fadeUp 0.35s ease' }}>
            <p style={styles.sectionTitle}>Welcome 👋</p>
            <p style={styles.sectionSub}>Enter your mobile number to get started</p>

            {/* Feature pills */}
            <div style={styles.features}>
              {[
                { icon: '⚡', label: 'Instant OTP' },
                { icon: '🔒', label: 'Secure Login' },
                { icon: '🆓', label: 'Free Service' },
              ].map(f => (
                <div key={f.label} style={styles.featurePill}>
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Phone input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Mobile Number</label>
              <div style={styles.phoneRow}>
                <div style={styles.countryBox}>
                  <svg width="18" height="13" viewBox="0 0 18 13">
                    <rect width="18" height="4.33" fill="#FF9933"/>
                    <rect y="4.33" width="18" height="4.33" fill="white"/>
                    <rect y="8.67" width="18" height="4.33" fill="#138808"/>
                    <circle cx="9" cy="6.5" r="1.7" stroke="#000080" strokeWidth="0.7" fill="none"/>
                  </svg>
                  <span style={styles.countryCode}>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendOTP(); }}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  placeholder="Enter mobile number"
                  style={{
                    ...styles.phoneInput,
                    ...(phoneFocused && !phoneError ? styles.phoneInputFocus : {}),
                    ...(phoneError ? styles.phoneInputError : {}),
                  }}
                />
              </div>
              {phoneError && (
                <div style={styles.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={styles.errorText}>{phoneError}</span>
                </div>
              )}
            </div>

            <button
              onClick={sendOTP}
              disabled={loading}
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = `linear-gradient(135deg, ${C.greenDark} 0%, #025525 100%)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`; }}
            >
              {loading ? (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                </svg>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Send OTP
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeUp 0.35s ease' }}>
            <button
              onClick={() => { setOtpSent(false); setOtp(['','','','','','']); }}
              style={styles.changeBtn}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Change number
            </button>

            <p style={styles.sectionTitle}>Enter OTP 🔐</p>
            <p style={{ ...styles.otpInfo, marginBottom: '20px' }}>
              6-digit code sent to{' '}
              <span style={styles.otpInfoBold}>+91 {phone}</span>
            </p>

            {/* OTP boxes */}
            <div style={{ marginBottom: '8px' }}>
              <label style={styles.label}>One-Time Password</label>
              <div style={styles.otpGrid} onPaste={handleOTPPaste}>
                {otp.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(r) => (otpRefs.current[idx] = r)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOTPChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOTPKeyDown(e, idx)}
                    onFocus={() => setFocusedOtp(idx)}
                    onBlur={() => setFocusedOtp(-1)}
                    style={{
                      ...styles.otpBox,
                      ...(val ? styles.otpBoxFilled : {}),
                      ...(focusedOtp === idx ? { borderColor: C.green, background: C.white, boxShadow: `0 0 0 3px ${C.greenLight}`, transform: 'scale(1.06)' } : {}),
                      width: '48px',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={styles.resendRow}>
              <span style={styles.resendText}>Didn't receive?</span>
              <button onClick={resendOTP} style={styles.resendBtn}>Resend OTP</button>
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading}
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = `linear-gradient(135deg, ${C.greenDark} 0%, #025525 100%)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`; }}
            >
              {loading ? (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                </svg>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Verify &amp; Continue
                </>
              )}
            </button>
          </div>
        )}

        {/* Divider + Terms */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
        </div>
        <p style={styles.terms}>
          By continuing, you agree to our{' '}
          <a href="/terms" style={styles.termsLink}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}