"use client"
import React, { useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #2e7d32;
    --green-light: #e8f5e9;
    --green-mid:   #43a047;
    --text:        #1a1a1a;
    --muted:       #5a6a72;
    --border:      #e0e7eb;
    --bg:          #f7f9fa;
    --white:       #ffffff;
    --font:        'Plus Jakarta Sans', sans-serif;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
  }

  .topbar {
    background: var(--green);
    color: #fff;
    text-align: center;
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    letter-spacing: 0.02em;
  }
  .topbar a { color: #fff; text-decoration: underline; }

  .nav {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    padding: 0 5vw;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 1.1rem; font-weight: 800;
    color: var(--green);
    text-decoration: none;
    letter-spacing: -0.01em;
  }
  .nav-logo .dot { color: var(--text); }
  .nav-links {
    display: flex; align-items: center; gap: 1.75rem;
    list-style: none;
  }
  .nav-links a {
    font-size: 0.88rem; font-weight: 600;
    color: var(--text); text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--green); }
  .nav-cta {
    background: var(--green);
    color: #fff; border: none;
    padding: 0.55rem 1.25rem;
    font-family: var(--font);
    font-size: 0.85rem; font-weight: 700;
    border-radius: 6px; cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
  }
  .nav-cta:hover { background: #1b5e20; }
  .nav-mobile-btn {
    display: none;
    background: none; border: none;
    font-size: 1.5rem; cursor: pointer; color: var(--text);
  }

  .page-hero {
    background: var(--green);
    padding: 3.5rem 5vw 3rem;
    position: relative;
    overflow: hidden;
  }
  .page-hero::before {
    content: 'PRIVACY';
    position: absolute; right: -20px; top: 50%;
    transform: translateY(-50%);
    font-size: clamp(5rem, 12vw, 10rem);
    font-weight: 800;
    color: rgba(255,255,255,0.07);
    letter-spacing: -0.02em;
    pointer-events: none;
    white-space: nowrap;
  }
  .breadcrumb {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.7);
    margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .breadcrumb a { color: rgba(255,255,255,0.7); text-decoration: none; }
  .breadcrumb a:hover { color: #fff; }
  .breadcrumb span { opacity: 0.5; }
  .page-hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800; color: #fff;
    letter-spacing: -0.02em; line-height: 1.15;
    margin-bottom: 0.6rem;
  }
  .page-hero p { color: rgba(255,255,255,0.75); font-size: 0.92rem; }
  .hero-meta {
    margin-top: 1.25rem;
    display: flex; gap: 1.5rem; flex-wrap: wrap;
  }
  .hero-badge {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 0.3rem 0.85rem;
    border-radius: 100px;
    font-size: 0.78rem; font-weight: 600;
  }

  .layout {
    max-width: 1100px;
    margin: 0 auto;
    padding: 3rem 5vw 5rem;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 3rem;
    align-items: start;
  }

  .sidebar {
    position: sticky; top: 120px;
  }
  .sidebar-label {
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.75rem;
  }
  .toc {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
  }
  .toc-item {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.7rem 1rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    font-size: 0.82rem; font-weight: 600;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
  }
  .toc-item:last-child { border-bottom: none; }
  .toc-item:hover, .toc-item.active {
    background: var(--green-light);
    color: var(--green);
  }
  .toc-num {
    font-size: 0.7rem; font-weight: 700;
    color: var(--green);
    background: var(--green-light);
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .toc-item.active .toc-num {
    background: var(--green); color: #fff;
  }
  .contact-card {
    margin-top: 1rem;
    background: var(--green);
    border-radius: 10px;
    padding: 1.25rem;
    color: #fff;
  }
  .contact-card h4 {
    font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;
  }
  .contact-card p { font-size: 0.78rem; opacity: 0.85; line-height: 1.55; }
  .contact-card a {
    display: inline-block; margin-top: 0.75rem;
    background: #fff; color: var(--green);
    padding: 0.45rem 1rem; border-radius: 6px;
    font-size: 0.8rem; font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .contact-card a:hover { opacity: 0.9; }

  .content { min-width: 0; }
  .update-bar {
    background: var(--green-light);
    border: 1px solid #c8e6c9;
    border-left: 3px solid var(--green);
    border-radius: 6px;
    padding: 0.85rem 1.1rem;
    font-size: 0.83rem;
    color: var(--green);
    margin-bottom: 2.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }

  .pp-section {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2rem 2rem 1.75rem;
    margin-bottom: 1.5rem;
    scroll-margin-top: 100px;
  }
  .pp-section:hover {
    border-color: #c8e6c9;
    box-shadow: 0 2px 12px rgba(46,125,50,0.06);
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .section-head {
    display: flex; align-items: flex-start; gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .section-icon {
    width: 40px; height: 40px;
    background: var(--green-light);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .section-num {
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--green);
    margin-bottom: 0.2rem;
  }
  .pp-section h2 {
    font-size: 1.1rem; font-weight: 800;
    letter-spacing: -0.01em; color: var(--text);
    line-height: 1.25;
  }
  .pp-section p {
    font-size: 0.9rem; color: var(--muted);
    line-height: 1.75; margin-bottom: 0.85rem;
  }
  .pp-section p:last-child { margin-bottom: 0; }
  .pp-section ul {
    list-style: none; margin: 0.75rem 0 0.85rem 0;
  }
  .pp-section ul li {
    font-size: 0.88rem; color: var(--muted);
    padding: 0.35rem 0 0.35rem 1.5rem;
    position: relative; line-height: 1.6;
    border-bottom: 1px dashed var(--border);
  }
  .pp-section ul li:last-child { border-bottom: none; }
  .pp-section ul li::before {
    content: '✓';
    position: absolute; left: 0;
    color: var(--green); font-weight: 700;
    font-size: 0.8rem;
  }
  .highlight-box {
    background: var(--green-light);
    border-radius: 8px;
    padding: 1rem 1.1rem;
    margin: 1rem 0;
    font-size: 0.87rem;
    color: #1b5e20;
    line-height: 1.65;
  }

  @media (max-width: 860px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { position: static; }
    .toc { display: none; }
    .nav-links { display: none; }
    .nav-mobile-btn { display: block; }
  }
  @media (max-width: 540px) {
    .page-hero { padding: 2.5rem 1.25rem 2rem; }
    .layout { padding: 2rem 1.25rem 3rem; gap: 1.5rem; }
    .pp-section { padding: 1.5rem 1.25rem; }
    .footer { flex-direction: column; text-align: center; }
  }
`;

const sections = [
  {
    id: 's1', num: '01', icon: '📋', title: 'Information We Collect',
    content: (
      <>
        <p>When you visit the Bharat Scrap Facilities website or book an appointment with us, we collect certain necessary information to provide you with the best possible service.</p>
        <p><strong style={{color:'#1a1a1a'}}>Personal Information:</strong></p>
        <ul>
          <li>Full name, phone number, and email address</li>
          <li>Vehicle details — make, model, year, fuel type, and condition</li>
          <li>Address and city (for vehicle pickup coordination)</li>
          <li>Government-issued ID (RC copy, Aadhaar — required for scrapping documentation)</li>
          <li>Bank account details (for payment settlement)</li>
        </ul>
        <p><strong style={{color:'#1a1a1a'}}>Automatically Collected Information:</strong></p>
        <ul>
          <li>IP address and browser type</li>
          <li>Pages visited and time spent on the website</li>
          <li>Device information (mobile or desktop)</li>
          <li>Anonymized usage data via Google Analytics</li>
        </ul>
      </>
    )
  },
  {
    id: 's2', num: '02', icon: '🎯', title: 'How We Use Your Information',
    content: (
      <>
        <p>Your information is used solely for service delivery and business operations. It is never sold or rented to any third party.</p>
        <ul>
          <li>Generating quotes and conducting vehicle valuation</li>
          <li>Scheduling appointments and coordinating vehicle pickup</li>
          <li>Processing RC transfer and government documentation</li>
          <li>Completing payment settlement and banking verification</li>
          <li>Providing customer support and follow-up communication</li>
          <li>Improving our services through website analytics</li>
          <li>Ensuring legal compliance with Motor Vehicles Act and CPCB guidelines</li>
        </ul>
        <div className="highlight-box">
          🔒 We never share your personal information with third-party marketers or advertisers. Data is shared with authorized agencies only when required for government-mandated documentation.
        </div>
      </>
    )
  },
  {
    id: 's3', num: '03', icon: '🤝', title: 'Information Sharing',
    content: (
      <>
        <p>Bharat Scrap Facilities shares your data only in limited and clearly defined circumstances:</p>
        <ul>
          <li><strong>Government Authorities:</strong> Vehicle scrapping certificates and RC cancellation — required documentation with MoRTH and the RTO</li>
          <li><strong>CPCB / State Pollution Control Boards:</strong> Environmental compliance reporting</li>
          <li><strong>Banking / Payment Partners:</strong> For processing payment settlements via UPI or NEFT</li>
          <li><strong>Logistics / Pickup Partners:</strong> To coordinate vehicle collection from your location</li>
        </ul>
        <p>Beyond these cases, your data is never shared, sold, or rented to any other party.</p>
      </>
    )
  },
  {
    id: 's4', num: '04', icon: '🛡️', title: 'Data Security',
    content: (
      <>
        <p>The security of your information is a top priority for us. We follow industry-standard practices to keep your data protected:</p>
        <ul>
          <li>SSL/TLS encryption for all data transmitted through our website</li>
          <li>Secure servers with restricted access controls</li>
          <li>Physical security for documents such as RC copies and ID proofs</li>
          <li>Bank details are processed only at the time of payment and are never stored</li>
          <li>Regular staff training on data handling and privacy protocols</li>
        </ul>
        <p>Please note that no method of transmission over the internet is 100% secure. If you notice any suspicious activity related to your account or data, please contact us immediately.</p>
      </>
    )
  },
  {
    id: 's5', num: '05', icon: '🍪', title: 'Cookies & Tracking',
    content: (
      <>
        <p>Our website uses cookies to enhance your browsing experience and improve our services:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for core website functionality such as session management and language preferences</li>
          <li><strong>Analytics Cookies:</strong> Google Analytics collects anonymized traffic data to help us understand how visitors use our site (opt-out available via Google)</li>
          <li><strong>Google Tag Manager (GTM):</strong> Used for page performance and event tracking</li>
        </ul>
        <p>You may disable cookies through your browser settings at any time. However, doing so may affect the functionality of certain features on our website. Cookies do not collect personally identifiable information.</p>
      </>
    )
  },
  {
    id: 's6', num: '06', icon: '⏳', title: 'Data Retention',
    content: (
      <>
        <p>We retain your data only for as long as necessary based on the purpose for which it was collected:</p>
        <ul>
          <li>Vehicle scrapping records — 7 years (as required by government regulations)</li>
          <li>Payment and banking records — 5 years (Income Tax Act compliance)</li>
          <li>Customer service and communication records — 2 years</li>
          <li>Website analytics data — 26 months (Google Analytics default retention)</li>
          <li>Marketing preferences — until you choose to unsubscribe</li>
        </ul>
        <div className="highlight-box">
          📌 Records mandated by government bodies such as CPCB and the RTO cannot be deleted before their prescribed retention periods — this is a regulatory requirement.
        </div>
      </>
    )
  },
  {
    id: 's7', num: '07', icon: '⚖️', title: 'Your Rights',
    content: (
      <>
        <p>Under the Information Technology Act, 2000 and the Digital Personal Data Protection (DPDP) Act, 2023, you have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Access:</strong> Request information about what personal data we hold about you</li>
          <li><strong>Correction:</strong> Ask us to update or correct inaccurate or outdated information</li>
          <li><strong>Deletion:</strong> Request removal of non-mandatory personal data we have stored</li>
          <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
          <li><strong>Grievance:</strong> File a complaint regarding how your data has been used or handled</li>
        </ul>
        <p>To exercise any of these rights, please email us at <a href="mailto:bharatscrapfacilities@gmail.com" style={{color:'var(--green)', fontWeight: 600}}>bharatscrapfacilities@gmail.com</a>. We will respond within 30 working days.</p>
      </>
    )
  },
  {
    id: 's8', num: '08', icon: '🔗', title: 'Third-Party Links',
    content: (
      <>
        <p>Our website may contain links to external platforms and services — such as Google Maps, social media pages (Facebook, Instagram, Twitter), or payment gateways.</p>
        <p>These third-party websites operate under their own privacy policies and are not governed by this document. We are not responsible for their data practices. We encourage you to review the privacy policy of any external site before sharing your information with them.</p>
      </>
    )
  },
  {
    id: 's9', num: '09', icon: '📞', title: 'Contact & Grievance',
    content: (
      <>
        <p>For any questions, concerns, or requests related to this Privacy Policy or your personal data, please reach out to our Grievance Officer:</p>
        <ul>
          <li><strong>Email:</strong> bharatscrapfacilities@gmail.com</li>
          <li><strong>Phone:</strong> +91 9355222165</li>
          <li><strong>Address:</strong> Gata No. 142, Near Testify Rice Mill, Rajarampur, Sikandarabad Industrial Area, Bulandshahr – 203205</li>
          <li><strong>Response Time:</strong> Within 30 working days of receiving your request</li>
        </ul>
        <p>If you are not satisfied with our response, you may also escalate your concern to CERT-In or the Data Protection Board of India.</p>
      </>
    )
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('s1');

  const handleTocClick = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <style>{styles}</style>

      

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-label">Contents</div>
          <nav className="toc">
            {sections.map(s => (
              <a
                key={s.id}
                className={`toc-item${activeSection === s.id ? ' active' : ''}`}
                href={`#${s.id}`}
                onClick={e => { e.preventDefault(); handleTocClick(s.id); }}
              >
                <span className="toc-num">{s.num}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="content">
          {/* <div className="update-bar">
            ℹ️ This Privacy Policy was last updated in June 2025. We will publish a notice on our website if any significant changes are made.
          </div> */}

          {sections.map(s => (
            <section className="pp-section" id={s.id} key={s.id}>
              <div className="section-head">
                <div className="section-icon">{s.icon}</div>
                <div className="section-head-text">
                  <div className="section-num">Section {s.num}</div>
                  <h2>{s.title}</h2>
                </div>
              </div>
              {s.content}
            </section>
          ))}
        </main>
      </div>
    </>
  );
}