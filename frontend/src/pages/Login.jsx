import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Information Showcase */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Campus Event AI
                </h2>
                <span className="text-xs text-indigo-400 font-mono">
                  Autonomous Multi-Agent System
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Verified Role-Based Campus Portal
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Sign in with your verified campus credentials to access event planning, venue coordination, resource logistics, and team dispatch dashboards.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Admin-Verified Role Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Autonomous 7-Agent Orchestration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time Team Dispatch & Task Audits</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Protected Roles
            </span>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded">Administrator</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Coordinator</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Venue Team</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Technical Team</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Volunteer Team</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Security Team</span>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Sign In to Campus Portal</h2>
            <p className="text-xs text-slate-400">
              Enter your registered and verified email address to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@campus.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              New campus member or team representative?{' '}
              <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              All registrations require verification and confirmation by the Campus Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
