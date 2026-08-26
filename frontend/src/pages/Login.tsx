import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, GraduationCap, Shield, Server, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'ASPIRANT' | 'ADMIN'>('ASPIRANT');
  const timerRef = useRef<any>(null);

  // Pre-warm backend immediately when user arrives on login page
  useEffect(() => {
    api.get('/auth/health').catch(() => {});
  }, []);

  // Timer to detect Render cold-start and provide crystal-clear user guidance
  useEffect(() => {
    if (isLoading) {
      setLoadingSeconds(0);
      timerRef.current = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoadingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: trimmedEmail,
        password
      });

      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        setAuth(user, accessToken, refreshToken);

        // Redirect based on server-verified role
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      // Generic secure error message
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 ring-1 ring-white/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Welcome to <span className="gradient-text">UPSC NewsHub AI</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Smart Current Affairs & Newspaper Research Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800/80 backdrop-blur-2xl">
          
          {/* Role Portal Selector */}
          <div className="mb-6 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedRoleTab('ASPIRANT');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedRoleTab === 'ASPIRANT'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Aspirant Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRoleTab('ADMIN');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                selectedRoleTab === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRoleTab === 'ADMIN' ? 'admin@example.com' : 'aspirant@example.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLoading && loadingSeconds >= 2 && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <Server className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>
                    {loadingSeconds < 6
                      ? 'Connecting to secure cloud server...'
                      : loadingSeconds < 15
                      ? 'Waking up cloud server instance... (Render free tier boot)'
                      : 'Finalizing database authentication... almost ready!'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(95, loadingSeconds * 6)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-75 ${
                selectedRoleTab === 'ADMIN'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {loadingSeconds < 3
                      ? 'Signing in...'
                      : `Connecting to Cloud (${loadingSeconds}s)...`}
                  </span>
                </div>
              ) : (
                <>
                  <span>{selectedRoleTab === 'ADMIN' ? 'Sign in to Admin Console' : 'Sign in as Aspirant'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              New Aspirant?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
