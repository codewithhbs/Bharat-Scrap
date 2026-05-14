'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';

/* ── Token Helpers ── */
const ACCESS_TOKEN_KEY  = "adpt_token"
const getAccessToken  = () => localStorage.getItem(ACCESS_TOKEN_KEY)


// ─── Color Constants ─────────────────────────────────────────────────────────
const PRIMARY = '#0F2412';
const PRIMARY_LIGHT = '#1a3a1e';
const PRIMARY_MEDIUM = '#2d5c34';
const PRIMARY_MUTED = 'rgba(15,36,18,0.08)';
const PRIMARY_BORDER = 'rgba(15,36,18,0.14)';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function IconChevron() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="#b0b8c1" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={PRIMARY} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={PRIMARY} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconKyc() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#16a34a" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#25D366" strokeWidth={1.9} />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="#25D366" strokeWidth={1.9} strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="#25D366" strokeWidth={1.9} strokeLinecap="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#ef4444" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16,17 21,12 16,7" stroke="#ef4444" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="#ef4444" strokeWidth={1.9} strokeLinecap="round" />
    </svg>
  );
}
function IconCar() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" stroke={PRIMARY} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="2.5" stroke={PRIMARY} strokeWidth={1.9} />
      <circle cx="16.5" cy="17.5" r="2.5" stroke={PRIMARY} strokeWidth={1.9} />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
      <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
    </svg>
  );
}

// ─── Profile Image / Avatar ──────────────────────────────────────────────────
function ProfileImage({ user }) {
  const imageUrl = user?.userImage?.img;
  const name = user?.name || 'User';
  const initials = name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');

  if (imageUrl) {
    return (
      <div className="avatar-wrap">
        <img src={imageUrl} alt={name} className="avatar-img" />
      </div>
    );
  }
  return (
    <div className="avatar-wrap">
      <div className="avatar-grad">
        <span className="avatar-text">{initials}</span>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ num, label, color, bg, border }) {
  return (
    <div className="stat-card" style={{ backgroundColor: bg, borderColor: border }}>
      <span className="stat-num" style={{ color }}>{num}</span>
      <span className="stat-lbl">{label}</span>
    </div>
  );
}

// ─── Menu Row ────────────────────────────────────────────────────────────────
function MenuRow({ icon, iconBg, label, sub, right, onPress, isLast, danger }) {
  return (
    <div
      className={`menu-row${!isLast ? ' menu-row--divider' : ''}${onPress ? ' menu-row--clickable' : ''}`}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={onPress ? (e) => e.key === 'Enter' && onPress() : undefined}
    >
      <div className="menu-icon-wrap" style={{ backgroundColor: iconBg }}>{icon}</div>
      <div className="menu-text">
        <span className={`menu-label${danger ? ' menu-label--danger' : ''}`}>{label}</span>
        {sub && <span className="menu-sub">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────
function SectionCard({ children }) {
  return <div className="section-card">{children}</div>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [cars, setCars] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, carsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/car/car-details-for-me'),
      ]);
      console.log("userRes",carsRes)
      setUser(userRes.data?.user || {});
      setCars(carsRes.data?.data || []);
    } catch (e) {
      console.log('Profile fetch error:', e);
      toast.error('Failed to load profile data');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Profile refreshed!');
  };

  const totalListed = cars.length;
  const soldCount = cars.filter(c => c.status === 'sold').length;
  const pendCount = cars.filter(c => c.status === 'pending').length;
  const isPhoneVerified = !!user?.isPhoneVerified;

  const handleLogout = () => {
    if (!confirm('Are you sure you want to log out?')) return;
    setLoadingLogout(true);
    try {
      // clearTokens() — call your token clearing logic here
      router.push('/login');
    } catch {
      toast.error('Something went wrong while logging out');
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/919079036042?text=Hi%2C%20I%20need%20help%20with%20BharatScrap', '_blank');
  };

  const displayName = user?.name || 'User';
  const displayPhone = user?.phone || user?.mobile || '';
  const displayCity = user?.city || user?.location || 'India';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      <style>{`
        /* ── Reset & Base ──────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .profile-root {
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          color: #1a2e1c;
        }

        /* ── Header ─────────────────────────────────────────────────────────── */
        .profile-header {
          background: linear-gradient(145deg, ${PRIMARY} 0%, ${PRIMARY_MEDIUM} 100%);
          padding: 36px 24px 40px;
          position: relative;
          overflow: hidden;
        }
        .profile-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .profile-header::after {
          content: '';
          position: absolute;
          top: 20px; right: 30px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .header-inner {
          max-width: 520px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }
        .header-name {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.4px;
          margin-top: 6px;
        }
        .header-phone {
          font-size: 13px;
          color: rgba(255,255,255,0.62);
          font-weight: 500;
        }
        .pill-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 5px 12px;
        }
        .pill-text {
          font-size: 11px;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }

        /* ── Refresh Button ──────────────────────────────────────────────────── */
        .refresh-btn {
          position: absolute;
          top: 16px; right: 16px;
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 8px 12px;
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
          z-index: 2;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.2); }
        .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Avatar ──────────────────────────────────────────────────────────── */
        .avatar-wrap {
          width: 76px; height: 76px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.45);
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          background: #e8ede9;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .avatar-grad {
          width: 100%; height: 100%;
          background: linear-gradient(145deg, #e8f0e9, #c8dbc9);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-text {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: ${PRIMARY};
          letter-spacing: -0.5px;
        }

        /* ── Body ────────────────────────────────────────────────────────────── */
        .profile-body {
          max-width: 560px;
          margin: 0 auto;
          padding: 16px 16px 40px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* ── Stats ───────────────────────────────────────────────────────────── */
        .stats-row {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }
        .stat-card {
          flex: 1;
          border-radius: 16px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid transparent;
          gap: 3px;
        }
        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .stat-lbl {
          font-size: 10px;
          color: #7a8a7c;
          font-weight: 500;
          text-align: center;
          line-height: 1.3;
        }

        /* ── Section Wrap ────────────────────────────────────────────────────── */
        .section-wrap { margin-top: 14px; }
        .section-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #8a9e8c;
          letter-spacing: 1.1px;
          margin-bottom: 8px;
          padding: 0 2px;
          display: block;
        }
        .section-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e4eae5;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(15,36,18,0.05);
        }

        /* ── Menu Row ────────────────────────────────────────────────────────── */
        .menu-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 16px;
          transition: background 0.15s;
        }
        .menu-row--divider {
          border-bottom: 1px solid #f0f4f1;
        }
        .menu-row--clickable {
          cursor: pointer;
        }
        .menu-row--clickable:hover { background: #f7faf7; }
        .menu-row--clickable:active { background: #eff4ef; }
        .menu-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .menu-text { flex: 1; }
        .menu-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a2e1c;
        }
        .menu-label--danger { color: #ef4444; }
        .menu-sub {
          display: block;
          font-size: 11px;
          color: #8a9e8c;
          margin-top: 2px;
        }

        /* ── Badge ───────────────────────────────────────────────────────────── */
        .badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid transparent;
          flex-shrink: 0;
        }
        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }
        .badge-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        /* ── Version ─────────────────────────────────────────────────────────── */
        .version-text {
          font-size: 11px;
          color: #9aab9c;
          text-align: center;
          margin-top: 24px;
        }

        /* ── Toast Override ──────────────────────────────────────────────────── */
        .Toastify__toast {
          border-radius: 12px !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .Toastify__toast--success {
          background: ${PRIMARY} !important;
        }

        /* ── Responsive ──────────────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .profile-header { padding: 28px 16px 36px; }
          .profile-body { padding: 12px 12px 32px; }
          .stat-num { font-size: 20px; }
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

      <div className="profile-root">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="profile-header">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>

          <div className="header-inner">
            <ProfileImage user={user} />
            <span className="header-name">{displayName}</span>
            {displayPhone && <span className="header-phone">{displayPhone}</span>}
            <div className="pill-row">
              <div className="pill">
                <IconPin />
                <span className="pill-text">{displayCity}</span>
              </div>
              {memberSince && (
                <div className="pill">
                  <span className="pill-text">Since {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="profile-body">

          {/* Stats */}
          <div className="stats-row">
            <StatCard
              num={String(totalListed)}
              label="Cars Listed"
              color={PRIMARY}
              bg="#edf3ee"
              border="#cfdfd1"
            />
            <StatCard
              num={String(soldCount)}
              label="Cars Sold"
              color="#15803d"
              bg="#f0fdf4"
              border="#bbf7d0"
            />
            <StatCard
              num={String(pendCount)}
              label="Pending"
              color="#92400e"
              bg="#fffbeb"
              border="#fde68a"
            />
          </div>

          {/* Account */}
          <div className="section-wrap">
            <span className="section-label">ACCOUNT</span>
            <SectionCard>
              <MenuRow
                icon={<IconEdit />}
                iconBg="#edf3ee"
                label="Edit Profile"
                sub="Update your name, phone & city"
                onPress={() => router.push('/profile/update')}
                right={<IconChevron />}
                isLast
              />
            </SectionCard>
          </div>

          {/* Verification */}
          <div className="section-wrap">
            <span className="section-label">VERIFICATION</span>
            <SectionCard>
              <MenuRow
                icon={<IconKyc />}
                iconBg={isPhoneVerified ? '#f0fdf4' : '#fffbeb'}
                label="Profile Verification"
                sub={isPhoneVerified ? 'Phone number verified ✓' : 'Verify your phone number'}
                onPress={() =>
                  toast.info(
                    isPhoneVerified
                      ? 'Your phone number is already verified.'
                      : 'To verify, please go to Edit Profile and update your phone number.'
                  )
                }
                right={
                  isPhoneVerified ? (
                    <div className="badge" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <div className="badge-dot" style={{ background: '#22c55e' }} />
                      <span className="badge-text" style={{ color: '#15803d' }}>Verified</span>
                    </div>
                  ) : (
                    <div className="badge" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                      <div className="badge-dot" style={{ background: '#f59e0b' }} />
                      <span className="badge-text" style={{ color: '#92400e' }}>Pending</span>
                    </div>
                  )
                }
                isLast
              />
            </SectionCard>
          </div>

          {/* Activity */}
          <div className="section-wrap">
            <span className="section-label">ACTIVITY</span>
            <SectionCard>
              <MenuRow
                icon={<IconCar />}
                iconBg="#edf3ee"
                label="History & Activity"
                sub={`${totalListed} car${totalListed !== 1 ? 's' : ''}`}
                onPress={() => router.push('/history')}
                right={<IconChevron />}
                isLast
              />
            </SectionCard>
          </div>

          {/* More */}
          <div className="section-wrap">
            <span className="section-label">MORE</span>
            <SectionCard>
              <MenuRow
                icon={<IconHelp />}
                iconBg="#f0fdf4"
                label="Help & Support"
                sub="Chat with us on WhatsApp"
                onPress={handleWhatsApp}
                right={<IconChevron />}
              />
              <MenuRow
                icon={<IconLogout />}
                iconBg="#fef2f2"
                label={loadingLogout ? 'Logging out…' : 'Logout'}
                sub="Sign out of your account"
                onPress={!loadingLogout ? handleLogout : undefined}
                right={null}
                danger
                isLast
              />
            </SectionCard>
          </div>

          <p className="version-text">© Bharat Scrap Facilities v1.0.0 · Made with ❤️ in India</p>
        </div>
      </div>
    </>
  );
}