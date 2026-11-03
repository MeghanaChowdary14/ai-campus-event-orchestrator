import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Bot, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, ROLE_PRESETS } = useAuth();
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

  const handleDemoLogin = async (presetEmail, presetPassword) => {
    setError('');
    setSubmitting(true);
    try {
      await login(presetEmail, presetPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoAccounts = [
    { role: 'Coordinator', name: 'Dr. Sarah Jenkins', email: 'coordinator@campus.edu', pass: 'Admin@123', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
    { role: 'Venue Team', name: 'Marcus Vance', email: 'venue@campus.edu', pass: 'Venue@123', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
    { role: 'Technical Team', name: 'Elena Rostova', email: 'tech@campus.edu', pass: 'Tech@123', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    { role: 'Volunteer Team', name: 'Aiden Patel', email: 'volunteer@campus.edu', pass: 'Volunteer@123', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
    { role: 'Security Team', name: 'Robert Stone', email: 'security@campus.edu', pass: 'Security@123', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
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
              Next-Generation Event Orchestration.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Enter college event goals and unleash 7 specialized AI agents to generate schedules, allocate venues, audit equipment, and dispatch team tasks with zero friction.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Agent AI Planning & Conflict Resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-Based Dashboards (Coordinator, Venue, Tech, Volunteer, Security)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dynamic Replanning & Historical Version Comparison</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Active Agents
            </span>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800 px-2 py-0.5 rounded">Planning</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Venue</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Schedule</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Resource</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Conflict</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Tasks</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded">Notifications</span>
            </div>
          </div>
        </div>

        {/* Right Login & Demo Account Selection */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Sign In to Campus Portal</h2>
            <p className="text-xs text-slate-400">
              Choose a 1-click test role below or enter your campus credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Role Demo Sign-in */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              ⚡ 1-Click Instant Demo Login (Pick Any Role)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoLogin(acc.email, acc.pass)}
                  disabled={submitting}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${acc.color}`}
                >
                  <div>
                    <span className="text-xs font-bold block">{acc.role}</span>
                    <span className="text-[10px] opacity-80">{acc.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              Or sign in with email
            </span>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. coordinator@campus.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
