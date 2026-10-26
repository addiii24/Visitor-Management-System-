import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCompanySettings } from '../services/storage';
import { DEMO_USERS } from '../config/company';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const settings = getCompanySettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  const ROLE_ROUTES = { guard: '/guard', planthead: '/planthead', admin: '/admin' };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // Brief UX delay
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate(ROLE_ROUTES[result.user.role] || '/');
    } else {
      setError(result.message);
    }
  }

  function fillCredentials(user) {
    setUsername(user.username);
    setPassword(user.password);
    setError('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#243b5c] to-[#0f2440] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Company Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl mb-4 border border-white/20 shadow-xl">
            <span className="text-white font-bold text-2xl tracking-tight">ABC</span>
          </div>
          <h1 className="text-white font-bold text-xl leading-tight">{settings.companyName}</h1>
          <p className="text-blue-300 text-sm mt-1">{settings.plantName}</p>
          <p className="text-blue-400 text-xs mt-0.5">{settings.companyAddress}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-200 text-xs font-medium tracking-wide">{settings.appName}</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Sign In</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access the system.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-slate-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <span>🔑 Demo Credentials (Click to {showDemo ? 'hide' : 'show'})</span>
              {showDemo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemo && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-amber-700 px-1">⚠️ Demo mode only — not production-secure. Click a role to auto-fill credentials.</p>
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => fillCredentials(user)}
                    className="w-full text-left p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.roleLabel}</p>
                        <p className="text-xs text-slate-500">Username: <span className="font-mono font-medium">{user.username}</span> · Password: <span className="font-mono font-medium">{user.password}</span></p>
                      </div>
                      <span className="text-xs text-[#1e3a5f] font-medium">Use →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-blue-400/60 text-xs mt-6">
          © {new Date().getFullYear()} {settings.companyName}
        </p>
      </div>
    </div>
  );
}
