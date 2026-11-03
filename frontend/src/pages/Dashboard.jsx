import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Wrench,
  Users,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [roleTasks, setRoleTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const isCoordinator = role === 'Coordinator';

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }

      // Fetch team tasks for specialized team view
      if (!isCoordinator) {
        const taskRes = await api.getTasks({ assignedTeam: role });
        if (taskRes.success) {
          setRoleTasks(taskRes.data);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [role]);

  const handleQuickStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await api.updateTaskStatus(taskId, {
        status: newStatus,
        progress: newStatus === 'Completed' ? 100 : 50,
      });
      await loadDashboard();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Aggregating campus event telemetry...</p>
        </div>
      </div>
    );
  }

  const { summary, eventsByCategory, taskStatusDistribution, teamTaskProgress, recentActivity, upcomingList } = data;

  const COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#8b5cf6'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> {role} Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {isCoordinator
              ? 'Multi-agent AI event orchestration engine is active. Monitor team deliverables, review AI blueprints, and resolve operational bottlenecks.'
              : `You are viewing the dedicated ${role} dashboard. Track assigned responsibilities, update task statuses, and verify facility readiness.`}
          </p>
        </div>

        {isCoordinator && (
          <div className="relative z-10 shrink-0 flex items-center gap-3">
            <Link
              to="/events/create"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" /> Plan New Event (AI)
            </Link>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Total Events"
          value={summary.totalEvents}
          icon={CalendarDays}
          color="indigo"
          link="/events"
        />
        <MetricCard
          title="Upcoming"
          value={summary.upcomingEvents}
          icon={Clock}
          color="blue"
          link="/events"
        />
        <MetricCard
          title="Pending Approvals"
          value={summary.pendingApprovals}
          icon={AlertTriangle}
          color="amber"
          badge={summary.pendingApprovals > 0 ? 'Review' : null}
          link="/events?status=Under%20Review"
        />
        <MetricCard
          title="Active Tasks"
          value={summary.activeTasks}
          icon={ClipboardList}
          color="cyan"
          link="/tasks"
        />
        <MetricCard
          title="Conflict Alerts"
          value={summary.conflictAlerts}
          icon={ShieldAlert}
          color="rose"
          badge={summary.conflictAlerts > 0 ? 'Action' : null}
        />
        <MetricCard
          title="Team Progress"
          value={`${summary.teamProgress}%`}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Specialized Role Task Focus View for Non-Coordinators */}
      {!isCoordinator && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                Active Deliverables for {role} ({roleTasks.length})
              </h2>
              <p className="text-xs text-slate-500">
                Direct operational tasks assigned by the AI Orchestrator
              </p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              View Task Kanban <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {roleTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No tasks currently queued for {role}. All assignments completed!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleTasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {task.priority} Priority
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : task.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status} ({task.progress}%)
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.status !== 'In Progress' && task.status !== 'Completed' && (
                        <button
                          onClick={() => handleQuickStatusUpdate(task._id, 'In Progress')}
                          disabled={updatingTaskId === task._id}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-semibold hover:bg-indigo-700 transition"
                        >
                          Start Work
                        </button>
                      )}
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => handleQuickStatusUpdate(task._id, 'Completed')}
                          disabled={updatingTaskId === task._id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700 transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Events by Category (Bar Chart) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Events by Academic & Cultural Category
              </h2>
              <p className="text-xs text-slate-500">
                Distribution across symposiums, hackathons & meets
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Breakdown (Pie Chart) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Task Completion Status
            </h2>
            <p className="text-xs text-slate-500">
              Real-time progress of active work packages
            </p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            {taskStatusDistribution.map((item) => (
              <div key={item.name}>
                <span className="text-[10px] text-slate-400 block">{item.name}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Progress Bars & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team Deliverables Progress */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Team Operational Progress
              </h2>
              <p className="text-xs text-slate-500">
                Completion rates across all 5 campus teams
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {teamTaskProgress.map((t) => (
              <div key={t.team} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {t.team === 'Coordinator' && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                    {t.team === 'Venue Team' && <Building2 className="w-3.5 h-3.5 text-amber-500" />}
                    {t.team === 'Technical Team' && <Wrench className="w-3.5 h-3.5 text-blue-500" />}
                    {t.team === 'Volunteer Team' && <Users className="w-3.5 h-3.5 text-emerald-500" />}
                    {t.team === 'Security Team' && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                    {t.team}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {t.completed}/{t.total} ({t.progress}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Event Calendar / Schedule Feed */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming Campus Event Calendar
              </h2>
              <p className="text-xs text-slate-500">
                Scheduled events and approved timetables
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              All Events →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No upcoming events scheduled.
              </p>
            ) : (
              upcomingList.map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition flex items-center justify-between gap-3 block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex flex-col items-center justify-center shrink-0">
                      <span>{new Date(ev.startDate).getDate()}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider">
                        {new Date(ev.startDate).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[240px]">
                        {ev.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{ev.category}</span>
                        <span>•</span>
                        <span>{ev.expectedAttendees} Students</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      ev.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ev.status === 'Under Review'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ev.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, badge, link }) => {
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50',
    cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-100 dark:border-cyan-900/50',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50',
  };

  const content = (
    <div className={`p-4 rounded-3xl border ${colorMap[color]} shadow-sm transition hover:shadow-md relative overflow-hidden flex flex-col justify-between h-28`}>
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 shrink-0 opacity-80" />
        {badge && (
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
            {badge}
          </span>
        )}
      </div>
      <div>
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white block">
          {value}
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block">
          {title}
        </span>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

export default Dashboard;
