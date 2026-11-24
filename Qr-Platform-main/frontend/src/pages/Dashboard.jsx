
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, PlusCircle, QrCode as QrCodeIcon,
  Activity, Zap, Layers3, Clock
} from 'lucide-react';
import Layout from '../components/Layout';
import QrCard from '../components/QrCard';
import client from '../api/client';
import { QR_TYPES } from '../qrTypes';

export default function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [mode, setMode] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (mode) params.mode = mode;

      const { data } = await client.get('/qr', { params });
      setQrCodes(data.qrCodes);
    } catch (err) {
      console.error('Failed to load QR codes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, type, mode]);

  useEffect(() => {
    const timer = setTimeout(fetchQrCodes, 250);
    return () => clearTimeout(timer);
  }, [fetchQrCodes]);

  function handleDeleted(id) {
    setQrCodes((prev) => prev.filter((q) => q.id !== id));
  }

  const totalScans = qrCodes.reduce(
    (sum, q) => sum + (q.scan_count || 0), 0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">

        {/* Animated background glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" />
          <div className="absolute top-[30%] right-[-150px] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px] animate-pulse" />
          <div className="absolute bottom-[-150px] left-[25%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[150px] animate-pulse" />

          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '45px 45px'
            }}
          />

          {/* Scan line */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 4px)'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">

            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-[0.3em] uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                System Dashboard / Overview
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                QR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Control Center
                </span>
              </h1>

              <p className="text-slate-400 mt-3">
                Manage, monitor and deploy your digital QR experiences.
              </p>

              {/* Live Clock */}
              <div className="flex flex-wrap items-center gap-3 mt-5 text-sm font-mono">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Clock size={16} />
                  <span>
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                <span className="text-slate-600">|</span>

                <span className="text-slate-400">
                  {currentTime.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>

                <span className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <Link
              to="/create"
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:shadow-[0_0_35px_rgba(0,255,255,0.35)] hover:scale-[1.02] transition-all"
            >
              <PlusCircle size={20} />
              Create QR Code
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

            <div className="group bg-white/[0.04] backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,255,255,0.08)] transition-all">
              <div className="flex justify-between items-center mb-5">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Layers3 size={24} />
                </div>
                <span className="text-xs text-cyan-400 tracking-widest">
                  QR ASSETS
                </span>
              </div>

              <p className="text-slate-400 text-sm">Total QR Codes</p>
              <h2 className="text-5xl font-bold mt-3 text-white">
                {qrCodes.length}
              </h2>
              <p className="text-xs text-slate-500 mt-3">
                Stored in your collection
              </p>
            </div>

            <div className="group bg-white/[0.04] backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.08)] transition-all">
              <div className="flex justify-between items-center mb-5">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Activity size={24} />
                </div>
                <span className="text-xs text-purple-400 tracking-widest">
                  ENGAGEMENT
                </span>
              </div>

              <p className="text-slate-400 text-sm">Total Scans</p>
              <h2 className="text-5xl font-bold mt-3 text-white">
                {totalScans}
              </h2>
              <p className="text-xs text-slate-500 mt-3">
                Recorded QR scans
              </p>
            </div>

            <div className="group bg-white/[0.04] backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 hover:border-blue-400/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.08)] transition-all">
              <div className="flex justify-between items-center mb-5">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Zap size={24} />
                </div>
                <span className="text-xs text-blue-400 tracking-widest">
                  SYSTEM
                </span>
              </div>

              <p className="text-slate-400 text-sm">Platform Status</p>

              <h2 className="text-2xl font-bold mt-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <span className="text-green-400">Operational</span>
              </h2>

              <p className="text-xs text-slate-500 mt-4">
                Dashboard interface active
              </p>
            </div>

          </div>

          {/* Search */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8">

            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Search size={18} className="text-cyan-400" />
              Search & Filter
            </h2>

            <div className="flex flex-wrap gap-3">

              <div className="relative flex-1 min-w-[220px]">
                <Search size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or tag..."
                  className="w-full bg-[#030712] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">All types</option>
                {QR_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">Static & Dynamic</option>
                <option value="static">Static only</option>
                <option value="dynamic">Dynamic only</option>
              </select>

            </div>
          </div>

          {/* Collection */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Your QR Collection
            </h2>

            <span className="text-cyan-400 text-xs tracking-widest border border-cyan-500/20 bg-cyan-500/5 rounded-full px-3 py-2">
              {qrCodes.length} ITEMS
            </span>
          </div>

          {loading ? (
            <div className="text-cyan-400 text-center py-20 animate-pulse font-mono">
              INITIALIZING DATA...
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-dashed border-cyan-500/30 rounded-2xl backdrop-blur-xl">
              <QrCodeIcon size={42} className="mx-auto text-cyan-400 mb-5" />

              <p className="text-white font-medium mb-2">
                {search || type || mode
                  ? 'No QR codes match your filters.'
                  : 'Your QR collection is empty.'}
              </p>

              <p className="text-slate-400 text-sm mb-5">
                Generate your first QR code to get started.
              </p>

              <Link
                to="/create"
                className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                Create your first QR <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {qrCodes.map((qr) => (
                <QrCard
                  key={qr.id}
                  qr={qr}
                  onDeleted={handleDeleted}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-slate-500 text-xs tracking-widest">
              UNIFIED QR PLATFORM / FUTURISTIC INTERFACE
            </p>

            <div className="flex items-center gap-2 text-cyan-400/60 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
