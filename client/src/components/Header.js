'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';

/* ── Token Helpers ── */
const ACCESS_TOKEN_KEY  = 'adpt_token';
const REFRESH_TOKEN_KEY = 'adpt_refresh_token';
const getAccessToken    = () => localStorage.getItem(ACCESS_TOKEN_KEY);

const navLinks = [
  { href: '/',                   label: 'Home' },
  { href: '/about-us',           label: 'About Us' },
  { href: '/scrap-your-vehicle', label: 'Scrap Your Vehicle' },
  { href: '/vehicle-inspection', label: 'Vehicle Inspection' },
  { href: '/faqs',               label: "FAQ's" },
  { href: '/contact-us',         label: 'Contact' },
];

/* ── SVG Icons ── */
const IconUser = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconLogout = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconLogin = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IconCar = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconCalendar = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

export default function Header() {
  const pathname = usePathname();

  /* ── UI state ── */
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);

  /* ── Auth state ── */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user,       setUser]       = useState({});

  const dropRef = useRef(null);

  /* ── Lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || sidebarOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, sidebarOpen]);

  /* ── Auth check ── */
  useEffect(() => {
    const check = () => setIsLoggedIn(!!getAccessToken());
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  /* ── Fetch user ── */
  const handleFetchUser = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) setUser(res.data.user || {});
    } catch (e) {
      console.error('Failed to fetch user', e);
    }
  }, []);

  useEffect(() => { handleFetchUser(); }, [handleFetchUser]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Role ── */
  const role      = user?.role || 'user';
  const isCraneMan = role === 'craneMan';

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setIsLoggedIn(false);
    setDropOpen(false);
    setUser({});
    window.location.href = '/';
  };

  const closeAll = () => {
    setMobileOpen(false);
    setSidebarOpen(false);
  };

  /* ── Role-based CTA ── */
  const PrimaryCTA = ({ onClick, className = 'btn btn-signin bg-white text-dark' }) => {
    if (isCraneMan) return (
      <Link href="/cranemanprocess" className={className} onClick={onClick}>
        <IconCalendar size={14} /> Appointments
      </Link>
    );
    return (
      <Link href="/car-listing" className={className} onClick={onClick}>
        List Your Car
      </Link>
    );
  };

  return (
    <>
      <style>{`
        /* ── Profile button ── */
        .btn-profile-bsf {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: background 0.18s, border-color 0.18s;
          vertical-align: middle;
          flex-shrink: 0;
        }
        .btn-profile-bsf:hover {
          background: rgba(255,255,255,0.28);
          border-color: rgba(255,255,255,0.6);
        }

        /* ── Login button ── */
        .btn-login-bsf {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.5);
          padding: 7px 16px;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.18s, border-color 0.18s;
          vertical-align: middle;
        }
        .btn-login-bsf:hover {
          background: rgba(255,255,255,0.15);
          border-color: #fff;
          color: #fff;
        }

        /* ── Desktop actions area ── */
        .hdr-bsf-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          vertical-align: middle;
        }

        /* ── Dropdown ── */
        .hdr-bsf-drop-wrap { position: relative; display: inline-block; }
        .hdr-bsf-drop {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.13);
          min-width: 185px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-6px) scale(0.97);
          pointer-events: none;
          transition: opacity 0.18s, transform 0.18s;
          z-index: 1050;
        }
        .hdr-bsf-drop.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .hdr-bsf-drop a,
        .hdr-bsf-drop button {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.13s;
          text-align: left;
          white-space: nowrap;
        }
        .hdr-bsf-drop a:hover         { background: #f0fdf4; color: #16a34a; }
        .hdr-bsf-drop .drop-logout    { color: #dc2626; }
        .hdr-bsf-drop .drop-logout:hover { background: #fff1f2; color: #b91c1c; }
        .hdr-bsf-drop hr { border: none; border-top: 1px solid #f3f4f6; margin: 4px 0; }
        .hdr-bsf-role-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 15px 5px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase;
          color: #6b7280; pointer-events: none;
        }
        .hdr-bsf-role-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #16a34a; flex-shrink: 0;
        }
        .hdr-bsf-role-dot.craneman { background: #7c3aed; }

        /* ── Mobile drawer role badge ── */
        .drawer-role-bsf {
          display: inline-flex; align-items: center; gap: 5px;
          margin: 4px 0 2px 0;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 20px; padding: 4px 10px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase; color: #15803d;
        }
        .drawer-role-bsf.craneman { background: #f5f3ff; border-color: #ddd6fe; color: #7c3aed; }
        .drawer-role-bsf-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        /* Mobile auth items */
        .mobile-menu .logout-item a,
        .mobile-menu .logout-item button {
          color: #dc2626 !important;
        }

        /* ── Btn with icon ── */
        .btn-signin-icon {
          display: inline-flex; align-items: center; gap: 6px;
        }
      `}</style>

      {/* ════════════════════════════════════
          NAVBAR
      ════════════════════════════════════ */}
      <header className="header header-fixed sticky-bar">

        {/* Top bar */}
        <div className="top-bar top-bar-2 top-bar-3 bg-transparent">
          <div className="container-fluid">
            <div className="d-flex align-item-start justify-content-start gap-3">
              <a href="tel:+919355222165" className="text-white">📞 Call: +91 9355222165</a>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-white">
                📍 Gata No. 142, Rajarampur, Sikandrabad Industrial Area, Bulandshahr – 203205
              </a>
            </div>
            <div className="social-icons d-flex align-items-end justify-content-end gap-3 ms-3">
              <a href="https://www.facebook.com/profile.php?id=100090914178310" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/bharatscrapfacilities/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com/bharat_scrap" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="mailto:bharatscrapfacilities@gmail.com">
                <i className="fas fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="container-fluid">
          <div className="main-header">
            <div className="header-left">

              {/* Logo */}
              <div className="header-logo">
                <Link className="d-flex" href="/">
                  <Image src="/assets/imgs/logo/logo-light.png" alt="Bharat Scrap Logo" width={150} height={100} priority />
                </Link>
              </div>

              {/* Desktop Nav links */}
              <div className="header-nav">
                <nav className="nav-main-menu">
                  <ul className="main-menu">
                    {navLinks.map(({ href, label }) => (
                      <li key={href}>
                        <Link href={href} className={`color-white${pathname === href ? ' active' : ''}`}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* ── Desktop Right ── */}
              <div className="header-right">

                {/* ── Auth area (desktop) ── */}
                <div className="d-none d-xxl-inline-flex hdr-bsf-actions me-2">
                  {!isLoggedIn ? (
                    /* NOT logged in → Login button + Book Appointment */
                    <>
                      <Link href="/login" className="btn-login-bsf">
                        <IconLogin size={14} /> Login
                      </Link>
                      <Link href="/contact-us" className="btn btn-signin bg-white text-dark btn-signin-icon">
                        Book An Appointment
                      </Link>
                    </>
                  ) : (
                    /* Logged in → Role CTA + Profile dropdown */
                    <>
                      <PrimaryCTA className="btn btn-signin bg-white text-dark btn-signin-icon" />

                      <div className="hdr-bsf-drop-wrap" ref={dropRef}>
                        <button
                          className="btn-profile-bsf"
                          onClick={() => setDropOpen(o => !o)}
                          aria-label="Profile menu"
                        >
                          <IconUser size={17} />
                        </button>

                        <div className={`hdr-bsf-drop${dropOpen ? ' open' : ''}`}>
                          {/* Role chip */}
                          <div className="hdr-bsf-role-chip">
                            <span className={`hdr-bsf-role-dot${isCraneMan ? ' craneman' : ''}`} />
                            {isCraneMan ? 'Crane Man' : 'User'}
                          </div>
                          <hr />

                          <Link href="/profile" onClick={() => setDropOpen(false)}>
                            <IconUser size={14} /> My Profile
                          </Link>

                          {isCraneMan ? (
                            <Link href="/cranemanprocess" onClick={() => setDropOpen(false)}>
                              <IconCalendar size={14} /> Appointments
                            </Link>
                          ) : (
                            <Link href="/history" onClick={() => setDropOpen(false)}>
                              <IconCar size={14} /> My Bookings
                            </Link>
                          )}

                          <hr />
                          <button className="drop-logout" onClick={handleLogout}>
                            <IconLogout size={14} /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar toggle */}
                <div
                  className="burger-icon-2 burger-icon-white"
                  onClick={() => setSidebarOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image src="/assets/imgs/template/icons/menu.svg" alt="Menu" width={24} height={24} />
                </div>

                {/* Mobile menu toggle */}
                <div
                  className={`burger-icon burger-icon-white${mobileOpen ? ' burger-close' : ''}`}
                  onClick={() => setMobileOpen(!mobileOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="burger-icon-top"></span>
                  <span className="burger-icon-mid"></span>
                  <span className="burger-icon-bottom"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Overlay ── */}
      {(mobileOpen || sidebarOpen) && (
        <div
          onClick={closeAll}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}

      {/* ════════════════════════════════════
          MOBILE MENU DRAWER
      ════════════════════════════════════ */}
      <div className={`mobile-header-active mobile-header-wrapper-style perfect-scrollbar button-bg-2${mobileOpen ? ' sidebar-visible' : ''}`}>
        <div className="mobile-header-wrapper-inner">
          <div className="mobile-header-logo">
            <Link className="d-flex" href="/" onClick={closeAll}>
              <Image src="/assets/imgs/logo/logo-dark.png" alt="Bharat Scrap Logo" width={130} height={45} />
            </Link>
            <div className="burger-icon burger-icon-white" onClick={() => setMobileOpen(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div className="mobile-header-content-area">
            <div className="perfect-scroll">
              <div className="mobile-menu-wrap mobile-header-border">
                <nav>
                  <ul className="mobile-menu font-heading">

                    {/* Nav links */}
                    {navLinks.map(({ href, label }) => (
                      <li key={href} className={pathname === href ? 'active' : ''}>
                        <Link href={href} onClick={closeAll}>{label}</Link>
                      </li>
                    ))}

                    {/* ── Auth section in mobile menu ── */}
                    {isLoggedIn ? (
                      <>
                        <li style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
                          <div className={`drawer-role-bsf${isCraneMan ? ' craneman' : ''}`}>
                            <span className="drawer-role-bsf-dot" />
                            {isCraneMan ? 'Crane Man' : 'User'}
                          </div>
                        </li>
                        <li>
                          <Link href="/profile" onClick={closeAll}>
                            My Profile
                          </Link>
                        </li>
                        {isCraneMan ? (
                          <li>
                            <Link href="/cranemanprocess" onClick={closeAll}>
                              Appointments
                            </Link>
                          </li>
                        ) : (
                          <li>
                            <Link href="/history" onClick={closeAll}>
                              My Bookings
                            </Link>
                          </li>
                        )}
                        <li className="logout-item">
                          <button
                            onClick={() => { closeAll(); handleLogout(); }}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#dc2626', fontSize: 15, fontWeight: 600,
                              padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
                            }}
                          >
                            <IconLogout size={15} /> Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <li style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
                        <Link href="/login" onClick={closeAll}>
                          Login / Register
                        </Link>
                      </li>
                    )}

                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SIDEBAR / OFF-CANVAS
      ════════════════════════════════════ */}
      <div className={`sidebar-canvas-wrapper perfect-scrollbar button-bg-2${sidebarOpen ? ' sidebar-visible' : ''}`}>
        <div className="sidebar-canvas-container">
          <div className="sidebar-canvas-head">
            <div className="sidebar-canvas-logo">
              <Link className="d-flex" href="/" onClick={closeAll}>
                <Image src="/assets/imgs/logo/logo-dark.png" alt="Bharat Scrap Logo" width={130} height={45} />
              </Link>
            </div>
            <div className="sidebar-canvas-lang">
              <a href="#" className="close-canvas" onClick={(e) => { e.preventDefault(); setSidebarOpen(false); }}>
                <Image src="/assets/imgs/template/icons/close.png" alt="Close" width={20} height={20} />
              </a>
            </div>
          </div>

          <div className="sidebar-canvas-content">
            <div className="box-author-profile">
              <p className="text-md-bold neutral-1000">
                Bharat Scrap Facilities provides safe and eco-friendly vehicle scrapping
                services. Our government-authorized facility ensures responsible dismantling,
                recycling, and disposal of old vehicles with complete documentation and
                customer support.
              </p>
            </div>

            <div className="box-contactus">
              <h6 className="title-contactus neutral-1000">Contact Us</h6>
              <div className="contact-info">
                <p className="text-md-medium neutral-1000">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Gata No.142, Near Testify Rice Mill, Rajarampur,
                  Sikandarabad Industrial Area, Bulandshahar – 203205
                </p>
                <p className="text-md-medium neutral-1000">
                  <i className="fas fa-phone me-2"></i>
                  <a href="tel:+919355222165">+91 9355222165</a>
                </p>
                <p className="text-md-medium neutral-1000">
                  <i className="fas fa-envelope me-2"></i>
                  <a href="mailto:bharatscrapfacilities@gmail.com">
                    bharatscrapfacilities@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}