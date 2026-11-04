import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Users,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, targetRole) => {
    setActionLoading(userId);
    setMsg(null);
    try {
      const res = await api.approveUser(userId, targetRole ? { role: targetRole } : {});
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'User approved successfully.' });
        await fetchUsers();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to approve user.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to reject and remove registration for "${name}"?`)) {
      return;
    }
    setActionLoading(userId);
    setMsg(null);
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Registration rejected.' });
        await fetchUsers();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to reject user.' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved && u.role !== 'Admin');
  const approvedUsers = users.filter((u) => u.isApproved);

  const filteredUsers = users.filter((u) => {
    if (filterStatus === 'pending') return !u.isApproved && u.role !== 'Admin';
    if (filterStatus === 'approved') return u.isApproved;
    return true;
  }).filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const roleColors = {
    Admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
    Coordinator: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200',
    'Venue Team': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
    'Technical Team': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    'Volunteer Team': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    'Security Team': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Admin Verification & Membership Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify applicant credentials, approve functional role assignments, and govern system access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{pendingUsers.length} Pending Approval</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>{approvedUsers.length} Active Staff</span>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{users.length}</div>
            <div className="text-xs text-slate-500">Total Registered Members</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingUsers.length}</div>
            <div className="text-xs text-slate-500">Pending Identity Verification</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{approvedUsers.length}</div>
            <div className="text-xs text-slate-500">Authorized & Operational</div>
          </div>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingUsers.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Registrations Requiring Your Confirmation ({pendingUsers.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingUsers.map((pUser) => (
              <div
                key={pUser._id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pUser.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{pUser.email}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        roleColors[pUser.role] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Requested: {pUser.role}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                    {pUser.department && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>Dept: {pUser.department}</span>
                      </div>
                    )}
                    {pUser.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Phone: {pUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>Applied: {new Date(pUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleApprove(pUser._id, pUser.role)}
                    disabled={actionLoading === pUser._id}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoading === pUser._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm & Approve</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(pUser._id, pUser.name)}
                    disabled={actionLoading === pUser._id}
                    className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Members Directory */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, department, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {['all', 'pending', 'approved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  filterStatus === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading registered personnel...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No registered members match your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Functional Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          roleColors[u.role] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {u.department || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'Admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> Root Admin
                        </span>
                      ) : u.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified & Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5" /> Pending Confirmation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'Admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {!u.isApproved ? (
                            <button
                              onClick={() => handleApprove(u._id, u.role)}
                              disabled={actionLoading === u._id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Approved</span>
                          )}

                          <button
                            onClick={() => handleReject(u._id, u.name)}
                            disabled={actionLoading === u._id}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950 font-bold text-[11px] transition"
                            title="Remove User"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
