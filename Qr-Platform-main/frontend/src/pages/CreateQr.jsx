
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Zap, ChevronLeft, Sparkles, QrCode } from 'lucide-react';
import Layout from '../components/Layout';
import DynamicIcon from '../components/DynamicIcon';
import client from '../api/client';
import { QR_TYPES, getQrType } from '../qrTypes';

export default function CreateQr() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [typeKey, setTypeKey] = useState('url');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('static');
  const [fields, setFields] = useState({});
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size, setSize] = useState(300);
  const [links, setLinks] = useState([{ label: '', url: '' }]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const typeDef = getQrType(typeKey);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const defaults = {};
    typeDef.fields.forEach((f) => {
      if (f.default) defaults[f.name] = f.default;
    });
    setFields(defaults);
    setMode(typeDef.alwaysDynamic ? 'dynamic' : 'static');
  }, [typeKey]);

  function updateField(name, value) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFileUpload(fieldName, file) {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await client.post('/qr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateField(fieldName, data.fileUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function updateLink(idx, key, value) {
    setLinks((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l))
    );
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: '', url: '' }]);
  }

  function removeLink(idx) {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Give your QR code a title.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        type: typeKey,
        mode,
        target_data: typeKey === 'multilink' ? {} : fields,
        fg_color: fgColor,
        bg_color: bgColor,
        size,
        links: typeKey === 'multilink'
          ? links.filter((l) => l.label && l.url)
          : undefined,
      };

      const { data } = await client.post('/qr', payload);
      navigate(`/qr/${data.qr.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create QR code');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#050b16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all";

  return (
    <Layout>
      <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">

        {/* Futuristic background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px] animate-pulse" />

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase tracking-[0.3em] mb-4">
              <Sparkles size={14} />
              QR Generation Studio
            </div>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">QR Experience</span>
                </h1>
                <p className="text-slate-400 mt-3">
                  Build, customize and deploy your digital QR codes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-cyan-300">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  SYSTEM ONLINE
                </div>
              </div>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 ? (
            <>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Choose QR technology</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Select what your QR code will contain.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {QR_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTypeKey(t.key);
                        setStep(2);
                      }}
                      className="group flex flex-col items-start gap-4 bg-[#050b16]/80 border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-400/[0.04] rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,255,255,0.08)]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
                        <DynamicIcon name={t.icon} size={22} className="text-cyan-400" />
                      </div>

                      <div>
                        <span className="text-white font-semibold text-sm">
                          {t.label}
                        </span>
                        <p className="text-slate-500 text-xs mt-2">
                          Configure {t.label.toLowerCase()} QR
                        </p>
                      </div>

                      <span className="text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        SELECT →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm mb-7 transition-colors"
              >
                <ChevronLeft size={16} /> Change QR type
              </button>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Form area */}
                <div className="xl:col-span-2">

                  <div className="bg-white/[0.03] backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 md:p-8 mb-6">

                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                        <DynamicIcon name={typeDef.icon} size={24} className="text-cyan-400" />
                      </div>

                      <div>
                        <p className="text-cyan-400 text-xs uppercase tracking-widest mb-2">
                          Selected technology
                        </p>
                        <h2 className="text-xl font-bold">
                          {typeDef.label} QR Code
                        </h2>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-6 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          QR title
                        </label>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          placeholder="e.g. My Portfolio, Restaurant Menu"
                          className={inputClass}
                        />
                      </div>

                      {/* Dynamic fields */}
                      {typeDef.key !== 'multilink' &&
                        typeDef.fields.map((f) => (
                          <div key={f.name}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                              {f.label}
                              {f.required && <span className="text-red-400"> *</span>}
                            </label>

                            {f.type === 'textarea' ? (
                              <textarea
                                required={f.required}
                                rows={4}
                                value={fields[f.name] || ''}
                                onChange={(e) => updateField(f.name, e.target.value)}
                                placeholder={f.placeholder}
                                className={`${inputClass} resize-none`}
                              />
                            ) : f.type === 'select' ? (
                              <select
                                value={fields[f.name] || f.default}
                                onChange={(e) => updateField(f.name, e.target.value)}
                                className={inputClass}
                              >
                                {f.options.map((o) => (
                                  <option key={o} value={o}>{o}</option>
                                ))}
                              </select>
                            ) : f.type === 'file' ? (
                              <div>
                                <label className="flex flex-col items-center gap-3 justify-center border border-dashed border-cyan-500/30 rounded-xl px-4 py-8 text-sm text-slate-400 cursor-pointer hover:border-cyan-400 hover:bg-cyan-400/[0.03] transition-all">
                                  <Upload size={24} className="text-cyan-400" />
                                  <span>{uploading ? 'Uploading...' : fields[f.name] ? 'Replace file' : 'Click to upload file'}</span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) =>
                                      e.target.files[0] &&
                                      handleFileUpload(f.name, e.target.files[0])
                                    }
                                  />
                                </label>

                                {fields[f.name] && (
                                  <p className="text-xs text-cyan-400 mt-3 truncate">
                                    ✓ {fields[f.name]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <input
                                type={f.type || 'text'}
                                required={f.required}
                                value={fields[f.name] || ''}
                                onChange={(e) => updateField(f.name, e.target.value)}
                                placeholder={f.placeholder}
                                className={inputClass}
                              />
                            )}
                          </div>
                        ))}

                      {/* Multi-link */}
                      {typeDef.key === 'multilink' && (
                        <div className="space-y-4">
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Your links
                          </label>

                          {links.map((l, i) => (
                            <div key={i} className="flex flex-col sm:flex-row gap-3">
                              <input
                                value={l.label}
                                onChange={(e) => updateLink(i, 'label', e.target.value)}
                                placeholder="Link name"
                                className="sm:w-1/3 bg-[#050b16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                              />

                              <input
                                value={l.url}
                                onChange={(e) => updateLink(i, 'url', e.target.value)}
                                placeholder="https://..."
                                className="flex-1 bg-[#050b16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
                              />

                              <button
                                type="button"
                                onClick={() => removeLink(i)}
                                className="text-slate-400 hover:text-red-400 px-3 py-2 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addLink}
                            className="flex items-center gap-2 text-cyan-400 text-sm font-medium hover:text-cyan-300"
                          >
                            <Plus size={16} /> Add another link
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Behavior */}
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">

                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Zap size={18} className="text-cyan-400" />
                      Behavior & customization
                    </h3>

                    {typeDef.supportsDynamic && !typeDef.alwaysDynamic && (
                      <div className="mb-7">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          QR mode
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setMode('static')}
                            className={`rounded-xl py-4 text-sm font-semibold border transition-all ${
                              mode === 'static'
                                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.05)]'
                                : 'border-white/10 text-slate-400 hover:border-white/30'
                            }`}
                          >
                            Static
                          </button>

                          <button
                            type="button"
                            onClick={() => setMode('dynamic')}
                            className={`flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold border transition-all ${
                              mode === 'dynamic'
                                ? 'border-purple-400 bg-purple-400/10 text-purple-400'
                                : 'border-white/10 text-slate-400 hover:border-white/30'
                            }`}
                          >
                            <Zap size={14} /> Dynamic
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 mt-3">
                          {mode === 'dynamic'
                            ? 'Editable after creation, and scans are tracked with analytics.'
                            : 'Content is baked into the QR image permanently and cannot be changed later.'}
                        </p>
                      </div>
                    )}

                    {typeDef.alwaysDynamic && (
                      <p className="text-xs text-purple-400 mb-6">
                        <Zap size={12} className="inline mr-1" />
                        Multi-link QR codes are always dynamic.
                      </p>
                    )}

                    {/* Colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Foreground
                        </label>

                        <div className="flex items-center gap-3 bg-[#050b16] border border-white/10 rounded-xl p-3">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-10 h-10 bg-transparent cursor-pointer border-0"
                          />
                          <span className="font-mono text-sm text-slate-300">{fgColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Background
                        </label>

                        <div className="flex items-center gap-3 bg-[#050b16] border border-white/10 rounded-xl p-3">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 bg-transparent cursor-pointer border-0"
                          />
                          <span className="font-mono text-sm text-slate-300">{bgColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Resolution / {size}px
                      </label>

                      <input
                        type="range"
                        min={150}
                        max={1000}
                        step={50}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />

                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>150px</span>
                        <span>1000px</span>
                      </div>
                    </div>
                  </div>

                  {/* Generate */}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      document.querySelector('form')?.requestSubmit();
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-sm rounded-xl py-4 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {saving ? 'GENERATING...' : 'GENERATE QR CODE →'}
                  </button>

                </div>

                {/* Side panel */}
                <div className="xl:col-span-1">
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 sticky top-6">

                    <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-widest uppercase mb-6">
                      <Sparkles size={15} />
                      Studio information
                    </div>

                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
                      <DynamicIcon name={typeDef.icon} size={40} className="text-cyan-400" />
                    </div>

                    <h3 className="text-center font-bold text-xl mb-2">
                      {typeDef.label}
                    </h3>

                    <p className="text-center text-slate-400 text-sm">
                      Configuration panel
                    </p>

                    <div className="border-t border-white/10 my-6" />

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Type</span>
                        <span className="text-cyan-400">{typeDef.label}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Mode</span>
                        <span className="text-white">{mode}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Resolution</span>
                        <span className="text-white">{size}px</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Foreground</span>
                        <span className="font-mono text-cyan-400">{fgColor}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Background</span>
                        <span className="font-mono text-white">{bgColor}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 my-6" />

                    <div className="bg-cyan-400/[0.04] border border-cyan-400/10 rounded-xl p-4">
                      <p className="text-cyan-400 text-xs font-semibold mb-2">
                        <Sparkles size={13} className="inline mr-1" />
                        DESIGN TIP
                      </p>
                      <p className="text-slate-400 text-xs leading-5">
                        Keep QR contrast high. Dark QR codes on light backgrounds are usually easier for scanners to read.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-green-400 text-xs mt-5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      GENERATION SYSTEM READY
                    </div>

                  </div>
                </div>

              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-white/10 pt-6 flex flex-wrap justify-between gap-3">
            <p className="text-slate-500 text-xs tracking-widest">
              UNIFIED QR / GENERATION STUDIO
            </p>
            <p className="text-cyan-400/60 text-xs font-mono">
              {currentTime.toLocaleDateString()} / SYSTEM ONLINE
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
