'use client';

import { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import api from '../../../../utils/api';

const PRIMARY = '#0F2412';
const PRIMARY_MEDIUM = '#2d5c34';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5" stroke="#64748B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5l-7 7 7 7" stroke="#64748B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth={2.2} />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="#94A3B8" strokeWidth={1.9} />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.38-.38a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" stroke="#94A3B8" strokeWidth={1.9} />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <div className="field-wrap">
      <span className="field-label">{label}</span>
      <div className="field-input-row">
        <div className="field-icon-wrap">{icon}</div>
        {children}
      </div>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return <p className="section-title">{title}</p>;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProfileUpdatePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', email: '' });
  const [image, setImage] = useState(null);     // preview URL (string)
  const [imageFile, setImageFile] = useState(null); // actual File object
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api('/auth/me');
        const data = res.data;
        const u = data?.user || {};
        setFormData({
          name:    u.name    || '',
          phone:   u.phone   || u.mobile || '',
          address: u.address || '',
          email:   u.email   || '',
        });
        if (u.userImage?.img) setImage(u.userImage.img);
      } catch {
        toast.error('Failed to load profile data');
      }
    };
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) { toast.warning('Name is required'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      if (formData.phone)   form.append('phone',   formData.phone.trim());
      if (formData.address) form.append('address', formData.address.trim());
      if (formData.email)   form.append('email',   formData.email.trim());
      if (imageFile)        form.append('userIdImage', imageFile);

      const res = await api.put('/auth/update_user_profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = res.data;

      if (data.success) {
        toast.success('Profile updated successfully!');
        setTimeout(() => router.back(), 1500);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.name
    ? formData.name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .pu-root {
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          color: #1a2e1c;
        }

        /* ── Top Bar ─────────────────────────────────────────────────────── */
        .topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border-bottom: 1px solid #e4eae5;
          padding: 12px 16px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .back-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: #f4f6f3;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .back-btn:hover { background: #e8ede9; }
        .topbar-title {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: ${PRIMARY};
          letter-spacing: -0.3px;
        }

        /* ── Avatar Zone ─────────────────────────────────────────────────── */
        .avatar-zone {
          background: #fff;
          border-bottom: 1px solid #e4eae5;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 16px;
          gap: 10px;
        }
        .avatar-trigger {
          position: relative;
          width: 88px; height: 88px;
          cursor: pointer;
        }
        .avatar-ring {
          width: 88px; height: 88px;
          border-radius: 24px;
          background: #edf3ee;
          border: 2px solid #cfdfd1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.15s;
        }
        .avatar-trigger:hover .avatar-ring { opacity: 0.88; }
        .avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 22px;
        }
        .avatar-initials {
          font-family: 'Sora', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: ${PRIMARY};
          letter-spacing: -1px;
        }
        .cam-badge {
          position: absolute;
          bottom: -4px; right: -4px;
          width: 28px; height: 28px;
          border-radius: 8px;
          background: ${PRIMARY};
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-hint {
          font-size: 11.5px;
          color: #8a9e8c;
          font-weight: 500;
        }
        .file-input-hidden { display: none; }

        /* ── Form Body ───────────────────────────────────────────────────── */
        .form-body {
          max-width: 560px;
          margin: 0 auto;
          padding: 20px 16px 48px;
        }

        .section-title {
          font-size: 10.5px;
          font-weight: 700;
          color: #8a9e8c;
          letter-spacing: 1.1px;
          text-transform: uppercase;
          margin-bottom: 10px;
          margin-top: 4px;
        }

        /* ── Field ───────────────────────────────────────────────────────── */
        .field-wrap { margin-bottom: 14px; }
        .field-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .field-input-row {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 0 13px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input-row:focus-within {
          border-color: ${PRIMARY};
          box-shadow: 0 0 0 3px rgba(15,36,18,0.07);
        }
        .field-icon-wrap {
          margin-right: 10px;
          opacity: 0.9;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .field-input {
          flex: 1;
          font-size: 14.5px;
          color: ${PRIMARY};
          font-weight: 500;
          padding: 13px 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }
        .field-input::placeholder { color: #cbd5e1; }
        .field-textarea {
          flex: 1;
          font-size: 14.5px;
          color: ${PRIMARY};
          font-weight: 500;
          padding: 13px 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          min-height: 76px;
          width: 100%;
          line-height: 1.5;
        }
        .field-textarea::placeholder { color: #cbd5e1; }

        /* ── Divider ─────────────────────────────────────────────────────── */
        .form-divider {
          height: 1px;
          background: #f0f4f1;
          margin: 16px 0;
        }

        /* ── Save Button ─────────────────────────────────────────────────── */
        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: ${PRIMARY};
          border: none;
          border-radius: 14px;
          padding: 15px;
          margin-top: 10px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .save-btn:hover:not(:disabled) { opacity: 0.88; }
        .save-btn:active:not(:disabled) { transform: scale(0.98); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .save-btn-text {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.2px;
        }

        /* ── Spinner ─────────────────────────────────────────────────────── */
        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Toast ───────────────────────────────────────────────────────── */
        .Toastify__toast {
          border-radius: 12px !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .Toastify__toast--success { background: ${PRIMARY} !important; }

        @media (max-width: 480px) {
          .form-body { padding: 16px 12px 40px; }
        }
      `}</style>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        theme="light"
      />

      <div className="pu-root">

        {/* ── Top Bar ───────────────────────────────────────────────────── */}
        <div className="topbar">
          <button className="back-btn" onClick={() => router.back()}>
            <IconBack />
          </button>
          <span className="topbar-title">Edit Profile</span>
        </div>

        {/* ── Avatar Zone ───────────────────────────────────────────────── */}
        <div className="avatar-zone">
          <div className="avatar-trigger" onClick={() => fileInputRef.current?.click()}>
            <div className="avatar-ring">
              {image
                ? <img src={image} alt="Profile" className="avatar-img" />
                : <span className="avatar-initials">{initials}</span>
              }
            </div>
            <div className="cam-badge"><IconCamera /></div>
          </div>
          <span className="avatar-hint">Tap to change photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="file-input-hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <div className="form-body">
          <SectionTitle title="Personal Info" />

          <Field label="Full Name" icon={<IconUser />}>
            <input
              className="field-input"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </Field>

          <Field label="Phone Number" icon={<IconPhone />}>
            <input
              className="field-input"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </Field>

          <Field label="Email Address" icon={<IconMail />}>
            <input
              className="field-input"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              autoCapitalize="none"
            />
          </Field>

          <div className="form-divider" />
          <SectionTitle title="Location" />

          <Field label="Address" icon={<IconPin />}>
            <textarea
              className="field-textarea"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your full address"
              rows={3}
            />
          </Field>

          {/* ── Save Button ─────────────────────────────────────────────── */}
          <button
            className="save-btn"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading
              ? <div className="spinner" />
              : <>
                  <IconCheck />
                  <span className="save-btn-text">Save Changes</span>
                </>
            }
          </button>
        </div>
      </div>
    </>
  );
}