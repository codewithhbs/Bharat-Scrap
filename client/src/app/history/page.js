'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import api from '../../../utils/api';

const PRIMARY = '#0F2412';
const PRIMARY_MEDIUM = '#2d5c34';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return 'Just now';
  if (diff < 3600)    return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} day ago`;
  return `${Math.floor(diff / 2592000)} month ago`;
}

const STATUS_MAP = {
  pending:    { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  approved:   { bg: '#DBEAFE', color: '#1e3a5f', label: 'Approved' },
  sold:       { bg: '#DCFCE7', color: '#15803d', label: 'Sold' },
  processing: { bg: '#EDE9FE', color: '#5B21B6', label: 'Processing' },
  rejected:   { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

const FILTERS = [
  { label: 'All',        value: 'all' },
  { label: 'Pending',    value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Sold',       value: 'sold' },
];

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className="badge" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Car Icon SVG ─────────────────────────────────────────────────────────────
function CarIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="3" width="15" height="13" rx="2" stroke={PRIMARY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8h4l3 5v3h-7V8z" stroke={PRIMARY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke={PRIMARY} strokeWidth={1.8} />
      <circle cx="18.5" cy="18.5" r="2.5" stroke={PRIMARY} strokeWidth={1.8} />
    </svg>
  );
}

// ─── Empty State Icon ─────────────────────────────────────────────────────────
function EmptyIcon() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#b0b8c1" strokeWidth={1.2} />
      <path d="M12 8v4M12 16h.01" stroke="#b0b8c1" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchCars = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api('/car/car-details-for-me');
      const data = res.data;
      if (data?.success) {
        const sorted = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCars(sorted);
      } else {
        toast.error(data?.message || 'Something went wrong while fetching data');
      }
    } catch {
      toast.error('Something went wrong while fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const filtered = activeFilter === 'all'
    ? cars
    : cars.filter(c => c.status === activeFilter);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .history-root {
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          color: #1a2e1c;
        }

        /* ── Header ──────────────────────────────────────────────────────── */
        .history-header {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border-bottom: 1px solid #e4eae5;
          padding: 18px 20px 14px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: ${PRIMARY};
        }
        .count-badge {
          background: ${PRIMARY};
          border-radius: 12px;
          padding: 2px 9px;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .refresh-btn {
          margin-left: auto;
          background: #edf3ee;
          border: none;
          border-radius: 10px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: ${PRIMARY};
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }
        .refresh-btn:hover { background: #d8e8da; }
        .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Filter Chips ─────────────────────────────────────────────────── */
        .filters-wrap {
          background: #fff;
          border-bottom: 1px solid #e4eae5;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .filters-wrap::-webkit-scrollbar { display: none; }
        .filters-inner {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          width: max-content;
        }
        .chip {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid #d1dbd2;
          background: #fff;
          font-size: 13px;
          font-weight: 500;
          color: #5a6e5c;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .chip:hover { background: #f4f6f3; }
        .chip.active {
          background: #edf3ee;
          border-color: ${PRIMARY};
          color: ${PRIMARY};
          font-weight: 600;
        }

        /* ── Content ─────────────────────────────────────────────────────── */
        .content {
          max-width: 640px;
          margin: 0 auto;
          padding: 20px 16px 40px;
        }

        /* ── Loading ─────────────────────────────────────────────────────── */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 80px 0;
        }
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid #e4eae5;
          border-top-color: ${PRIMARY};
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 14px; color: #8a9e8c; }

        /* ── Empty State ─────────────────────────────────────────────────── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
        }
        .empty-title {
          font-size: 14px;
          font-weight: 500;
          color: #8a9e8c;
        }

        /* ── List ────────────────────────────────────────────────────────── */
        .car-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── History Item ─────────────────────────────────────────────────── */
        .history-item {
          background: #fff;
          border-radius: 14px;
          border: 1px solid rgba(15,36,18,0.07);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: pointer;
          transition: box-shadow 0.15s, transform 0.12s;
          box-shadow: 0 1px 4px rgba(15,36,18,0.05);
          text-decoration: none;
          color: inherit;
        }
        .history-item:hover {
          box-shadow: 0 4px 14px rgba(15,36,18,0.1);
          transform: translateY(-1px);
        }
        .item-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .car-icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #edf3ee;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .item-info { flex: 1; min-width: 0; }
        .item-name {
          font-size: 14px;
          font-weight: 700;
          color: ${PRIMARY};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-meta {
          font-size: 12px;
          color: #8a9e8c;
          margin-top: 2px;
        }
        .item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid #f0f4f1;
        }
        .item-fuel {
          font-size: 13px;
          font-weight: 500;
          color: ${PRIMARY_MEDIUM};
        }
        .item-date {
          font-size: 11px;
          color: #8a9e8c;
        }

        /* ── Badge ───────────────────────────────────────────────────────── */
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        /* ── Toast ───────────────────────────────────────────────────────── */
        .Toastify__toast {
          border-radius: 12px !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .Toastify__toast--success { background: ${PRIMARY} !important; }

        @media (max-width: 480px) {
          .content { padding: 16px 12px 32px; }
          .history-header { padding: 14px 16px 12px; }
        }
      `}</style>

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar closeOnClick pauseOnHover={false} theme="light" />

      <div className="history-root">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="history-header">
          <span className="header-title">My History</span>
          {cars.length > 0 && (
            <span className="count-badge">{cars.length}</span>
          )}
          <button
            className="refresh-btn"
            onClick={() => fetchCars(true)}
            disabled={refreshing}
          >
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {/* ── Filter Chips ─────────────────────────────────────────────────── */}
        <div className="filters-wrap">
          <div className="filters-inner">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`chip${activeFilter === f.value ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span className="loading-text">Loading...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <EmptyIcon />
              <span className="empty-title">No history found</span>
            </div>
          ) : (
            <div className="car-list">
              {filtered.map(item => {
                const detail  = item.carDetail || {};
                const carName = `${detail.make || ''} ${detail.model || ''}`.trim() || 'Unknown Car';
                const year    = detail?.manufacturingYear || '';
                const plate   = item.rcNumber || detail.rcNumber || '—';
                const km      = item.kmDriven
                  ? Number(item.kmDriven).toLocaleString('en-IN') + ' km'
                  : '—';

                return (
                  <div
                    key={item._id}
                    className="history-item"
                    onClick={() => router.push(`/history/${item._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && router.push(`/history/${item._id}`)}
                  >
                    <div className="item-top">
                      <div className="car-icon-wrap"><CarIcon /></div>
                      <div className="item-info">
                        <div className="item-name">{carName} {year}</div>
                        <div className="item-meta">{plate} · {km}</div>
                      </div>
                      <Badge status={item.status} />
                    </div>

                    <div className="item-bottom">
                      <span className="item-fuel">
                        {detail.fuelType || '—'} · {detail.bodyType || '—'}
                      </span>
                      <span className="item-date">{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}