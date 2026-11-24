import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  ChevronLeft, Download, Copy, Check, Zap,
  Trash2, Circle, Activity, Shield, ExternalLink
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

  useEffect(() => {
    let objectUrl;

    async function load() {
      try {
        setLoading(true);

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
      } catch (error) {
        console.error('Failed to load QR details:', error);
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
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed');
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${qr.title}"? This can't be undone.`)) return;

    try {
      await client.delete(`/qr/${id}`);
      navigate('/');
    } catch (error) {
      alert('Failed to delete QR code');
    }
  }

  async function toggleActive() {
    try {
      const { data } = await client.put(`/qr/${id}`, {
        is_active: !qr.is_active
      });
      setQr(data.qr);
    } catch (error) {
      alert('Failed to update QR status');
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        `${API_BASE_URL}/r/${qr.short_code}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      alert('Unable to copy link');
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyan-400 font-mono text-sm tracking-widest">
              LOADING QR INTELLIGENCE...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!qr) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-10 text-center">
          <h1 className="text-xl font-bold text-white">QR code not found</h1>
          <Link to="/" className="text-cyan-400 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const typeDef = getQrType(qr.type);

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden bg-[#070b14] text-white">

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#00e5ff 1px,transparent 1px),linear-gradient(90deg,#00e5ff 1px,transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8">

          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition mb-8"
          >
            <ChevronLeft size={17} />
            Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                  <DynamicIcon
                    name={typeDef.icon}
                    size={22}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-mono text-cyan-400 tracking-[0.2em] uppercase">
                    QR Intelligence
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {qr.title}
                  </h1>
                </div>
              </div>

              <p className="text-slate-400 text-sm">
                {typeDef.label} · Created{' '}
                {new Date(qr.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300">
                  SYSTEM ONLINE
                </span>
              </div>

              {qr.mode === 'dynamic' && (
                <div
                  className={`px-4 py-2 rounded-full border text-xs font-mono ${
                    qr.is_active
                      ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400'
                      : 'border-red-400/20 bg-red-400/5 text-red-400'
                  }`}
                >
                  {qr.is_active ? 'ACTIVE' : 'DISABLED'}
                </div>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">

            {/* Left */}
            <div className="space-y-6">

              {/* QR Preview */}
              <div className="relative rounded-3xl border border-cyan-400/20 bg-white p-6 shadow-[0_0_50px_rgba(0,229,255,0.08)]">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#070b14] border border-cyan-400/20 rounded-full text-[10px] font-mono text-cyan-400 tracking-widest">
                  QR PREVIEW
                </div>

                <div className="flex items-center justify-center min-h-[300px]">
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt={qr.title}
                      className="w-full max-w-[280px] object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Download */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Download size={16} className="text-cyan-400" />
                  Export QR
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-300 transition text-sm"
                  >
                    <Download size={15} />
                    PNG
                  </button>

                  <button
                    onClick={() => handleDownload('svg')}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-purple-400/20 bg-purple-400/5 hover:bg-purple-400/10 text-purple-300 transition text-sm"
                  >
                    <Download size={15} />
                    SVG
                  </button>
                </div>
              </div>

              {/* Dynamic Link */}
              {qr.mode === 'dynamic' && (
                <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur-xl p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ExternalLink size={15} className="text-cyan-400" />
                    Redirect Link
                  </h3>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 text-xs font-mono text-cyan-300 bg-black/40 rounded-lg p-3 truncate">
                      {API_BASE_URL}/r/{qr.short_code}
                    </code>

                    <button
                      onClick={copyLink}
                      className="p-3 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/10 transition"
                    >
                      {copied ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} className="text-cyan-400" />
                      )}
                    </button>
                  </div>

                  {copied && (
                    <p className="text-emerald-400 text-xs mt-2">
                      Link copied successfully
                    </p>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
                {qr.mode === 'dynamic' && (
                  <button
                    onClick={toggleActive}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition text-sm ${
                      qr.is_active
                        ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300 hover:bg-red-400/10 hover:text-red-300'
                        : 'border-red-400/20 bg-red-400/5 text-red-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                    }`}
                  >
                    <Circle
                      size={12}
                      className={qr.is_active ? 'fill-emerald-400' : 'fill-red-400'}
                    />
                    {qr.is_active ? 'Disable QR Code' : 'Enable QR Code'}
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-400/20 bg-red-400/5 text-red-300 hover:bg-red-400/10 transition text-sm"
                >
                  <Trash2 size={15} />
                  Delete QR Code
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">

              {/* Analytics */}
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
                      icon={<Shield size={17} />}
                    />
                    <Stat
                      label="BROWSERS"
                      value={analytics.scansByBrowser.length}
                      icon={<Zap size={17} />}
                    />
                  </div>

                  {/* Chart */}
                  <div className="rounded-3xl border border-cyan-400/10 bg-white/[0.03] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Scan Activity
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          QR scan history
                        </p>
                      </div>

                      <div className="px-3 py-1 rounded-lg bg-cyan-400/5 border border-cyan-400/20 text-xs text-cyan-300 font-mono">
                        ANALYTICS
                      </div>
                    </div>

                    {analytics.scansByDay.length === 0 ? (
                      <div className="py-16 text-center">
                        <Activity
                          size={35}
                          className="text-slate-600 mx-auto mb-3"
                        />
                        <p className="text-slate-400 text-sm">
                          No scan data yet
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          Share your QR to collect activity
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
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
                                stopColor="#00D9C0"
                                stopOpacity={0.5}
                              />
                              <stop
                                offset="100%"
                                stopColor="#00D9C0"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#263245"
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />

                          <Tooltip
                            contentStyle={{
                              background: '#0d1422',
                              border: '1px solid #1e3a50',
                              borderRadius: 12,
                              color: '#fff'
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#00D9C0"
                            strokeWidth={3}
                            fill="url(#scanGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Recent Scans */}
                  {analytics.recentScans.length > 0 && (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                      <h3 className="font-semibold mb-5 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" />
                        Recent Activity
                      </h3>

                      <div className="space-y-3">
                        {analytics.recentScans.map((s, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-black/20 border border-white/5"
                          >
                            <div>
                              <p className="text-sm text-white">
                                {new Date(s.scanned_at).toLocaleString()}
                              </p>
                            </div>

                            <div className="text-xs font-mono text-slate-400">
                              {s.device_type} · {s.browser} · {s.os}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-purple-400/20 bg-purple-400/5 p-6">
                  <h3 className="font-semibold mb-2 text-purple-300">
                    Static QR Mode
                  </h3>
                  <p className="text-sm text-slate-400 leading-6">
                    This QR code contains its destination directly inside the
                    image. Scan analytics and destination editing through a
                    redirect are not available for static QR codes.
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h3 className="font-semibold mb-5 flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  QR Content
                </h3>

                <div className="space-y-3">
                  {Object.entries(qr.target_data || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col sm:flex-row sm:gap-4 p-3 rounded-xl bg-black/20 border border-white/5"
                    >
                      <span className="text-xs uppercase tracking-wider text-slate-400 sm:w-32 shrink-0">
                        {k.replace(/_/g, ' ')}
                      </span>

                      <span className="text-sm text-white break-all">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.02] p-4 flex items-center gap-3">
                <Activity size={16} className="text-cyan-400" />
                <p className="text-xs text-slate-400">
                  Unified QR Platform · QR management interface
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
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-cyan-400/30 transition">
      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/5 blur-2xl rounded-full" />

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono text-slate-400 tracking-widest">
          {label}
        </p>
        <div className="text-cyan-400">{icon}</div>
      </div>

      <div className="text-3xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}
