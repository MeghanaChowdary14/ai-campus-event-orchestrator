import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, UserPlus, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Volunteer Team',
    department: 'Campus Events',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await register(formData);
      if (res && res.success) {
        setRegisteredSuccess(true);
        setRegisteredUser(res.data);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    { value: 'Coordinator', label: 'Coordinator (Executive Event Planning & AI Approval)' },
    { value: 'Venue Team', label: 'Venue Team (Facility Inspections, Space & Capacities)' },
    { value: 'Technical Team', label: 'Technical Team (AV, Stage Power, Networks & IT)' },
    { value: 'Volunteer Team', label: 'Volunteer Team (Check-In Logistics & Stage Hospitality)' },
    { value: 'Security Team', label: 'Security Team (Perimeter Safety & Crowd Screening)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 relative z-10">
        {registeredSuccess ? (
          <div className="text-center py-6">
            <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 max-w-md mx-auto">
              Thank you, <span className="font-semibold text-white">{registeredUser?.name}</span>. Your application for the{' '}
              <span className="font-semibold text-indigo-400">{registeredUser?.role}</span> role has been recorded.
            </p>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left mb-6 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Status: Pending Administrator Verification</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The Campus Administrator must review your identity and approve your assigned role ({registeredUser?.role}) before access is granted. You will be able to log in as soon as permission is confirmed.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Register for Campus Access</h2>
                <p className="text-xs text-slate-400">Role assignments are subject to Administrator verification</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. erostova@campus.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password (Min 6 characters)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Requested Campus Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-400/90 mt-1">
                  * Administrator will verify your credential and confirm this role before activation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 012-3456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  'Submit Registration for Admin Approval'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Already have an approved account?{' '}
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
                Sign In here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
