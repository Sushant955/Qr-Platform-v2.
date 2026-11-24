
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden text-white flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage:
          "linear-gradient(rgba(3,10,25,0.15), rgba(3,10,25,0.15)), url('/auth-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,220,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow Effects */}
      <div className="absolute w-96 h-96 bg-cyan-400/20 blur-[120px] rounded-full top-0 left-0 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full bottom-0 right-0 pointer-events-none" />

      {/* Register */}
      <div className="relative w-full max-w-md z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-300/20 border border-cyan-200/50 flex items-center justify-center shadow-lg shadow-cyan-400/30 backdrop-blur-md">
            <ScanLine size={28} className="text-cyan-300" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
              UNIFIED <span className="text-cyan-300">QR</span>
            </h1>
            <p className="text-[10px] tracking-[4px] text-cyan-100/80">
              DIGITAL INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Glass Card */}
        <div className="bg-[#0b1630]/80 backdrop-blur-2xl border border-cyan-300/30 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20">

          {/* Heading */}
          <div className="mb-7">
            <p className="text-cyan-300 text-xs tracking-[3px] mb-3 font-semibold">
              ACCOUNT REGISTRATION
            </p>

            <h2 className="text-3xl font-bold mb-2 drop-shadow-md">
              Create account
            </h2>

            <p className="text-blue-100/80 text-sm">
              Join Unified QR and build your QR workspace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 text-sm text-red-300 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-xs text-blue-100/80 mb-2 font-medium">
                FULL NAME
              </label>

              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full bg-white/10 border border-cyan-200/20 rounded-xl px-4 py-3 text-white placeholder:text-blue-100/50 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-blue-100/80 mb-2 font-medium">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full bg-white/10 border border-cyan-200/20 rounded-xl px-4 py-3 text-white placeholder:text-blue-100/50 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-blue-100/80 mb-2 font-medium">
                PASSWORD
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-white/10 border border-cyan-200/20 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-blue-100/50 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 transition-all"
                  placeholder="Minimum 8 characters"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-100/70 hover:text-cyan-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="text-xs text-blue-100/50 mt-2">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 text-[#050816] font-bold rounded-xl py-3.5 shadow-lg shadow-cyan-400/30 hover:shadow-xl hover:shadow-cyan-400/50 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create my account'}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-cyan-200/20" />
            <span className="text-blue-100/60 text-xs">SECURE REGISTRATION</span>
            <div className="h-px flex-1 bg-cyan-200/20" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-blue-100/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-300 font-semibold hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </p>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-cyan-100/80">
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-md shadow-cyan-300/50" />
          SYSTEM ONLINE
          <span className="mx-2">|</span>
          UNIFIED QR PLATFORM
        </div>

      </div>
    </div>
  );
}
