import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DynamicReplanningModal from '../components/DynamicReplanningModal';
import PlanVersionCompareModal from '../components/PlanVersionCompareModal';
import EditPlanModal from '../components/EditPlanModal';
import AgentProgressModal from '../components/AgentProgressModal';
import {
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building2,
  Package,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  GitCompare,
  Edit3,
  Check,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  ListOrdered,
  Layers,
  Wrench,
  Info,
} from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isCoordinator = role === 'Coordinator';

  const [event, setEvent] = useState(null);
  const [versions, setVersions] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Modals state
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isProgressComplete, setIsProgressComplete] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, schedule, venues, resources, budget, teams, conflicts, agentLogs

  const loadEventData = async () => {
    try {
      setLoading(true);
      const res = await api.getEventById(id);
      if (res.success) {
        setEvent(res.data.event);
        setVersions(res.data.versions || []);
      }

      const venueRes = await api.getVenues();
      if (venueRes.success) {
        setVenues(venueRes.data);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [id]);

  // Action Handlers
  const handleRegeneratePlan = async () => {
    try {
      setIsProgressModalOpen(true);
      setIsProgressComplete(false);
      setActionLoading(true);

      const res = await api.generatePlan(id);
      setTimeout(async () => {
        setIsProgressComplete(true);
        await loadEventData();
      }, 2500);
    } catch (err) {
      alert(`Regeneration failed: ${err.message}`);
      setIsProgressModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveConflicts = async () => {
    try {
      setActionLoading(true);
      const res = await api.resolveConflicts(id);
      if (res.success) {
        setActionMessage('AI Conflict Detection Agent resolved flagged bottlenecks.');
        await loadEventData();
      }
    } catch (err) {
      alert(`Conflict resolution error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDynamicReplan = async (replanData) => {
    try {
      setActionLoading(true);
      const res = await api.replanEvent(id, replanData);
      if (res.success) {
        setActionMessage('Dynamic replanning complete. New revision generated.');
        await loadEventData();
      }
    } catch (err) {
      alert(`Replanning error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualPlanSave = async (planUpdates) => {
    try {
      setActionLoading(true);
      const res = await api.updatePlan(id, planUpdates);
      if (res.success) {
        setActionMessage('Manual adjustments saved.');
        await loadEventData();
      }
    } catch (err) {
      alert(`Update error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!window.confirm('Approve this AI Event Plan and automatically dispatch live tasks across all 5 team dashboards?')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.approvePlan(id);
      if (res.success) {
        setActionMessage('Master plan approved! Live tasks deployed across Venue, Tech, Volunteer, and Security teams.');
        await loadEventData();
      }
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPlan = async () => {
    const reason = window.prompt('Please provide feedback / reason for rejection:');
    if (reason === null) return;
    try {
      setActionLoading(true);
      const res = await api.rejectPlan(id, reason);
      if (res.success) {
        setActionMessage('Plan marked as rejected. Coordinator feedback recorded.');
        await loadEventData();
      }
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !event) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[60vh] text-xs text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        Loading AI Event Plan Blueprint...
      </div>
    );
  }

  const plan = event.currentPlan?.planData || {};
  const summary = plan.summary || {};
  const schedule = plan.schedule || [];
  const venueAllocations = plan.venueAllocation || [];
  const resources = plan.resourceRequirements || [];
  const budgetEst = plan.budgetEstimation || {};
  const teamAssignments = plan.teamAssignments || [];
  const conflicts = plan.conflicts || [];
  const recommendations = plan.recommendations || [];
  const agentLogs = plan.agentLogs || [];

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back link & Status banner */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Events Directory
        </Link>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition flex items-center gap-1.5 shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
              Compare Versions ({versions.length})
            </button>
          )}

          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              event.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : event.status === 'Under Review'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {event.status} (Rev v{event.currentPlan?.versionNumber || 1})
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-mono">
              {event.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> {event.expectedAttendees} Attendees
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {new Date(event.startDate).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summary.overview || event.description}
          </p>
        </div>

        {/* Feasibility Ring Badge */}
        <div className="flex items-center gap-4 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
              AI Feasibility
            </span>
            <span className="text-2xl font-black text-white">
              {summary.feasibilityScore || 88}
              <span className="text-xs text-indigo-300 font-normal">/100</span>
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              Risk: {summary.riskLevel || 'Low'}
            </span>
          </div>

          <div className="h-10 w-px bg-white/10" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
              Est. Total Cost
            </span>
            <span className="text-xl font-black text-emerald-400">
              ${budgetEst.totalEstimatedCost?.toLocaleString() || summary.estimatedTotalCost || 0}
            </span>
            <span className="text-[10px] text-slate-300 block">
              Budget: ${event.budget?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons Bar matching Section 6 & 7 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Dynamic Replanning & Regenerate */}
        <div className="flex flex-wrap items-center gap-2">
          {isCoordinator && (
            <>
              <button
                onClick={handleRegeneratePlan}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
                title="Rerun the 7 AI Agents"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Regenerate Plan
              </button>

              <button
                onClick={() => setIsReplanModalOpen(true)}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-xs font-semibold text-amber-800 dark:text-amber-200 transition flex items-center gap-1.5"
                title="Dynamic Replanning for venue disruption"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Dynamic Replanning
              </button>

              {unresolvedConflicts.length > 0 && (
                <button
                  onClick={handleResolveConflicts}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition flex items-center gap-1.5"
                  title="Auto resolve bottlenecks"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Resolve Conflicts ({unresolvedConflicts.length})
                </button>
              )}

              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Plan
              </button>
            </>
          )}
        </div>

        {/* Right: Approve or Reject (Coordinator Authorized Only) */}
        <div className="flex items-center gap-2">
          {isCoordinator && event.status !== 'Approved' && (
            <>
              <button
                onClick={handleRejectPlan}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-500" /> Reject Plan
              </button>

              <button
                onClick={handleApprovePlan}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Approve Plan & Deploy Tasks
              </button>
            </>
          )}

          {event.status === 'Approved' && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Master Plan Approved & Live
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto space-x-2 text-xs font-semibold pb-1">
        {[
          { id: 'overview', label: 'Summary & Highlights', icon: FileText },
          { id: 'schedule', label: `Activity Schedule (${schedule.length})`, icon: Clock },
          { id: 'venues', label: 'Venue Allocation', icon: Building2 },
          { id: 'resources', label: `Resource Requirements (${resources.length})`, icon: Package },
          { id: 'budget', label: 'Budget Estimation', icon: DollarSign },
          { id: 'teams', label: 'Team Assignments', icon: Users },
          { id: 'conflicts', label: `Conflicts (${conflicts.length})`, icon: AlertTriangle, badge: unresolvedConflicts.length },
          { id: 'agentLogs', label: `AI Agent Telemetry (${agentLogs.length})`, icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Multi-Agent Event Blueprint Overview
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {summary.overview}
              </p>

              {event.specialRequirements && (
                <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">
                    Special Requirements Incorporated:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {event.specialRequirements}
                  </p>
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> AI Strategic Recommendations
              </h3>
              <ul className="space-y-2 text-xs">
                {recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Quick Metrics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Key Deliverable Stats
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Scheduled Sessions:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{schedule.length}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Allocated Venues:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{venueAllocations.length}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Hardware Resource Items:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{resources.length}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Assigned Campus Teams:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{teamAssignments.length}</span>
                </div>
                <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-500">Active Conflicts:</span>
                  <span className={`font-bold ${unresolvedConflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {unresolvedConflicts.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/60 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Operational Task Deployment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {event.status === 'Approved'
                  ? 'Tasks are active. Track live completion in the Task Management console.'
                  : 'Approving this plan will automatically create tasks for Venue, Technical, Volunteer, and Security teams.'}
              </p>
              <Link
                to="/tasks"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Go to Task Kanban <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Chronological Activity Timetable
              </h2>
              <p className="text-xs text-slate-500">
                Generated by Schedule Agent with non-overlapping time slots and transition buffers
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.activity}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        📍 {item.venue}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                        👥 Lead: {item.leadTeam}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 block">
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Venue Allocation */}
      {activeTab === 'venues' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Venue Allocations
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated by Venue Agent for capacity limits, acoustics, and double-booking avoidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venueAllocations.map((v, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {v.venueName}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {v.status || 'Allocated & Verified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Rated Capacity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {v.capacity} Attendees
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Expected Crowd</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {v.expectedCrowd} Attendees
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Capacity Utilization</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {v.utilizationPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        v.utilizationPercentage > 100
                          ? 'bg-rose-500'
                          : v.utilizationPercentage > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, v.utilizationPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Resource Requirements */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hardware, Audio-Visual & Equipment Requirements
            </h2>
            <p className="text-xs text-slate-500">
              Calculated by Resource Agent according to cohort scale and technical demands
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3 rounded-l-xl">Resource Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Required</th>
                  <th className="p-3 text-center">In Stock</th>
                  <th className="p-3 text-right">Unit Cost</th>
                  <th className="p-3 text-right">Total Cost</th>
                  <th className="p-3 rounded-r-xl text-center">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resources.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.resourceName}
                    </td>
                    <td className="p-3 text-slate-500">{item.category}</td>
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantityRequired}
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {item.quantityAvailable}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      ${item.unitCost}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      ${item.totalCost}
                    </td>
                    <td className="p-3 text-center">
                      {item.shortage ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                          Shortage Deficit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Budget Estimation */}
      {activeTab === 'budget' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Budgetary Allocation & Projected Expenditure
            </h2>
            <p className="text-xs text-slate-500">
              Computed by Planning & Resource Agents vs Sanctioned University Budget
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Venue Allocation', val: budgetEst.venueCost || 0 },
              { label: 'Equipment & AV', val: budgetEst.equipmentCost || 0 },
              { label: 'Logistics & Supplies', val: budgetEst.logisticsCost || 0 },
              { label: 'Security & Safety', val: budgetEst.securityCost || 0 },
              { label: 'Contingency Reserve', val: budgetEst.contingencyCost || 0 },
            ].map((b, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
              >
                <span className="text-[10px] text-slate-400 block">{b.label}</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                  ${b.val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500">Total Projected Cost</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">
                ${budgetEst.totalEstimatedCost?.toLocaleString() || summary.estimatedTotalCost || 0}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Sanctioned Event Budget</span>
              <span className="text-2xl font-black text-emerald-600 block">
                ${event.budget?.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500">Fiscal Variance</span>
              <span
                className={`text-xl font-black ${
                  (budgetEst.remainingBudget || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {(budgetEst.remainingBudget || 0) >= 0 ? '+' : ''}$
                {budgetEst.remainingBudget?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Team Assignments */}
      {activeTab === 'teams' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Cross-Functional Team Responsibilities
            </h2>
            <p className="text-xs text-slate-500">
              Formulated by Task Assignment Agent across functional departments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamAssignments.map((team, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {team.team}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                    {team.assignedStaffCount} Staff Assigned
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Core Responsibilities:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {team.responsibilities?.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Identified Conflicts */}
      {activeTab === 'conflicts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Multi-Dimensional Conflict Detection Audit
              </h2>
              <p className="text-xs text-slate-500">
                Identified by Conflict Detection Agent across schedules, venue capacities, and hardware stock
              </p>
            </div>
            {isCoordinator && unresolvedConflicts.length > 0 && (
              <button
                onClick={handleResolveConflicts}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Auto-Resolve All
              </button>
            )}
          </div>

          {conflicts.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-600 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="font-bold">No conflicts detected! Master plan is 100% compliant.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((c, i) => (
                <div
                  key={c.id || i}
                  className={`p-4 rounded-2xl border transition ${
                    c.resolved
                      ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : c.severity === 'High'
                      ? 'border-rose-300 bg-rose-50/40 dark:bg-rose-950/20'
                      : 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          c.resolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.severity === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.resolved ? 'Resolved' : `${c.severity} Severity`} • {c.type}
                      </span>
                    </div>
                    {c.resolved && (
                      <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mitigated
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {c.description}
                  </p>

                  <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      💡 Suggested AI Mitigation:
                    </span>{' '}
                    {c.suggestedSolution || c.resolutionNote}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Agent Logs */}
      {activeTab === 'agentLogs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Autonomous AI Agent Execution Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Audit log detailing the pipeline execution across all 7 backend AI agent modules
            </p>
          </div>

          <div className="space-y-2">
            {agentLogs.map((log, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.agentName}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.message}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <DynamicReplanningModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        onReplan={handleDynamicReplan}
        event={event}
        venues={venues}
      />

      <PlanVersionCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        versions={versions}
        currentPlanId={event.currentPlan?._id}
      />

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleManualPlanSave}
        planData={plan}
      />

      <AgentProgressModal
        isOpen={isProgressModalOpen}
        isComplete={isProgressComplete}
        onFinish={() => setIsProgressModalOpen(false)}
      />
    </div>
  );
};

export default EventDetail;
