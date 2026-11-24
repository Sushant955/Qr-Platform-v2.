
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white flex items-center justify-center px-4">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,220,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full top-0 left-0" />
      <div className="absolute w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full bottom-0 right-0" />

      {/* Login */}
      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <ScanLine size={26} className="text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              UNIFIED <span className="text-cyan-400">QR</span>
            </h1>
            <p className="text-[10px] tracking-[4px] text-gray-500">
              DIGITAL INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-cyan-950/30">

          <div className="mb-7">
            <p className="text-cyan-400 text-xs tracking-[3px] mb-3">
              AUTHENTICATION
            </p>

            <h2 className="text-3xl font-bold mb-2">
              Welcome back
            </h2>

            <p className="text-gray-400 text-sm">
              Sign in to access your QR workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full bg-[#0b1020] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                PASSWORD
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-[#0b1020] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-[#050816] font-bold rounded-xl py-3.5 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in to workspace'}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-gray-600 text-xs">SECURE ACCESS</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-gray-400">
            New to Unified QR?{' '}
            <Link
              to="/register"
              className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
            >
              Create account
            </Link>
          </p>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          SYSTEM ONLINE
          <span className="mx-2">|</span>
          UNIFIED QR PLATFORM
        </div>

      </div>
    </div>
  );
}
