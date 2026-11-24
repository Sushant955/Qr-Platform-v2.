
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  ChevronLeft, Download, Copy, Check, Zap,
  Trash2, Circle, Activity, ShieldCheck,
  QrCode, Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import DynamicIcon from '../components/DynamicIcon';
import client, { API_BASE_URL } from '../api/client';
import { getQrType } from '../qrTypes';

export default function QrDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [qr, setQr] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let objectUrl;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const { data } = await client.get(`/qr/${id}`);
        setQr(data.qr);

        const imgRes = await client.get(`/qr/${id}/image?format=png`, {
          responseType: 'blob'
        });

        objectUrl = window.URL.createObjectURL(imgRes.data);
        setImgUrl(objectUrl);

        if (data.qr.mode === 'dynamic') {
          const { data: a } = await client.get(`/qr/${id}/analytics`);
          setAnalytics(a);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load QR details. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  async function handleDownload(format) {
    try {
      const res = await client.get(`/qr/${id}/image?format=${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qr.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Download failed. Please try again.');
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${qr.title}"? This can't be undone.`)) return;

    try {
      setActionLoading(true);
      await client.delete(`/qr/${id}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Unable to delete QR code.');
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleActive() {
    try {
      setActionLoading(true);
      const { data } = await client.put(`/qr/${id}`, {
        is_active: !qr.is_active
      });
      setQr(data.qr);
    } catch (err) {
      console.error(err);
      alert('Unable to change QR status.');
    } finally {
      setActionLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${API_BASE_URL}/r/${qr.short_code}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert('Unable to copy link.');
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyan-300 text-sm font-mono animate-pulse">
              LOADING QR INTELLIGENCE...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !qr) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-red-400 mb-4">{error || 'QR not found.'}</p>
          <Link to="/" className="text-cyan-400 hover:text-white">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const typeDef = getQrType(qr.type);

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden bg-[#050816]">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-all text-sm mb-8"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <DynamicIcon
                    name={typeDef.icon}
                    size={22}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {qr.title}
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    {typeDef.label} · {new Date(qr.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                <Activity size={14} className="text-cyan-300" />
                <span className="text-xs font-mono text-cyan-200">
                  SYSTEM ONLINE
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-400/20 bg-purple-400/5">
                <ShieldCheck size={14} className="text-purple-300" />
                <span className="text-xs font-mono text-purple-200">
                  QR SECURED
                </span>
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

            {/* Left panel */}
            <div className="space-y-5">

              {/* QR image */}
              <div className="relative bg-white rounded-3xl p-7 shadow-[0_0_50px_rgba(0,255,255,0.08)]">
                <div className="absolute -top-3 -right-3">
                  <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
                    <QrCode size={20} className="text-black" />
                  </div>
                </div>

                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt={qr.title}
                    className="w-full max-w-[260px] mx-auto"
                  />
                )}

                <div className="text-center mt-4">
                  <p className="text-gray-500 text-xs font-mono">
                    QR MATRIX
                  </p>
                </div>
              </div>

              {/* Download card */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <Download size={16} className="text-cyan-300" />
                  Export QR Code
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 hover:bg-cyan-400/20 hover:border-cyan-400/50 transition-all text-sm font-medium"
                  >
                    <Download size={15} />
                    Download PNG
                  </button>

                  <button
                    onClick={() => handleDownload('svg')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-purple-400/10 border border-purple-400/20 text-purple-200 hover:bg-purple-400/20 hover:border-purple-400/50 transition-all text-sm font-medium"
                  >
                    <Download size={15} />
                    Download SVG
                  </button>
                </div>
              </div>

              {/* Dynamic link */}
              {qr.mode === 'dynamic' && (
                <div className="bg-white/[0.03] backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap size={15} className="text-cyan-300" />
                    Redirect Link
                  </h3>

                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3">
                    <code className="flex-1 text-xs text-cyan-300 font-mono truncate">
                      {API_BASE_URL}/r/{qr.short_code}
                    </code>

                    <button
                      onClick={copyLink}
                      title="Copy link"
                      className="p-2 rounded-lg hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-300 transition-all"
                    >
                      {copied
                        ? <Check size={16} className="text-green-400" />
                        : <Copy size={16} />}
                    </button>
                  </div>

                  {copied && (
                    <p className="text-green-400 text-xs mt-2">
                      Link copied successfully!
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold text-sm mb-3">
                  QR Controls
                </h3>

                {qr.mode === 'dynamic' && (
                  <button
                    onClick={toggleActive}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all text-sm disabled:opacity-50"
                  >
                    <Circle
                      size={12}
                      className={
                        qr.is_active
                          ? 'text-green-400 fill-green-400'
                          : 'text-red-400 fill-red-400'
                      }
                    />
                    {qr.is_active
                      ? 'Active — Disable QR'
                      : 'Disabled — Enable QR'}
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-red-500/5 border border-red-500/20 text-red-300 hover:bg-red-500/15 transition-all text-sm disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Delete QR Code
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-6">

              {/* Stats */}
              {qr.mode === 'dynamic' && analytics ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Stat
                      label="TOTAL SCANS"
                      value={analytics.totalScans}
                      icon={<Activity size={17} />}
                    />

                    <Stat
                      label="DEVICES"
                      value={analytics.scansByDevice.length}
                      icon={<Sparkles size={17} />}
                    />

                    <Stat
                      label="BROWSERS"
                      value={analytics.scansByBrowser.length}
                      icon={<Zap size={17} />}
                    />
                  </div>

                  {/* Chart */}
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                      <div>
                        <h3 className="text-white font-semibold">
                          Scan Analytics
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                          Scan activity over time
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-cyan-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        ANALYTICS
                      </div>
                    </div>

                    {analytics.scansByDay.length === 0 ? (
                      <div className="py-16 text-center">
                        <Activity size={35} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400 text-sm">
                          No scans recorded yet.
                        </p>
                        <p className="text-slate-600 text-xs mt-2">
                          Share your QR code to begin collecting analytics.
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={analytics.scansByDay}>
                          <defs>
                            <linearGradient
                              id="scanGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#22d3ee"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="100%"
                                stopColor="#22d3ee"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#1e293b"
                            vertical={false}
                            strokeDasharray="3 3"
                          />

                          <XAxis
                            dataKey="day"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />

                          <Tooltip
                            contentStyle={{
                              background: '#0f172a',
                              border: '1px solid #164e63',
                              borderRadius: 12,
                              color: '#fff',
                              fontSize: 12
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#22d3ee"
                            strokeWidth={3}
                            fill="url(#scanGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Recent scans */}
                  {analytics.recentScans?.length > 0 && (
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-300" />
                        Recent Scans
                      </h3>

                      <div className="space-y-3">
                        {analytics.recentScans.map((s, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-cyan-400/20 transition-all"
                          >
                            <div>
                              <p className="text-slate-300 text-xs font-medium">
                                {new Date(s.scanned_at).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {[s.device_type, s.browser, s.os].map((item, j) => (
                                <span
                                  key={j}
                                  className="text-[10px] font-mono px-2 py-1 rounded-lg bg-cyan-400/5 border border-cyan-400/10 text-cyan-200"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={20} className="text-purple-300" />
                    <h3 className="text-white font-semibold">
                      Static QR Code
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm leading-6">
                    This QR code contains fixed content. Static QR codes do
                    not track scans or allow destination changes. Create a
                    dynamic QR code to enable scan analytics and flexible
                    redirection.
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                    <QrCode size={17} className="text-purple-300" />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold">
                      QR Content
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Encoded destination information
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(qr.target_data || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col sm:flex-row sm:gap-4 p-3 rounded-xl bg-black/20 border border-white/5"
                    >
                      <span className="text-slate-500 text-xs uppercase tracking-wider sm:w-32 shrink-0">
                        {k}
                      </span>

                      <span className="text-slate-200 text-sm break-all">
                        {typeof v === 'object'
                          ? JSON.stringify(v)
                          : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center py-5">
                <p className="text-slate-600 text-xs font-mono">
                  UNIFIED QR PLATFORM · INTELLIGENCE PANEL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03] transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500 text-xs font-mono tracking-wider">
          {label}
        </p>

        <div className="text-cyan-300 p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/10">
          {icon}
        </div>
      </div>

      <div className="text-3xl font-bold text-white tracking-tight">
        {value}
      </div>

      <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full group-hover:w-full transition-all duration-700" />
      </div>
    </div>
  );
}
