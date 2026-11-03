import React, { useState } from 'react';
import { History, X, GitCompare, CheckCircle2, ShieldAlert, DollarSign, Calendar, Building2 } from 'lucide-react';

const PlanVersionCompareModal = ({ isOpen, onClose, versions = [], currentPlanId }) => {
  const [selectedV1Index, setSelectedV1Index] = useState(0);
  const [selectedV2Index, setSelectedV2Index] = useState(versions.length > 1 ? 1 : 0);

  if (!isOpen || versions.length === 0) return null;

  const v1 = versions[selectedV1Index] || versions[0];
  const v2 = versions[selectedV2Index] || versions[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
      case 'Under Review':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300';
      case 'Superseded':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Event Plan Version History & Comparison
                <span className="text-xs font-normal text-slate-500">
                  ({versions.length} revision{versions.length > 1 ? 's' : ''})
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Compare multi-agent plan iterations and dynamic replanning logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Left Blueprint (Version A)
            </label>
            <select
              value={selectedV1Index}
              onChange={(e) => setSelectedV1Index(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {versions.map((ver, idx) => (
                <option key={ver._id} value={idx}>
                  Version {ver.versionNumber} ({ver.status}) - {ver.changeSummary.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Right Blueprint (Version B)
            </label>
            <select
              value={selectedV2Index}
              onChange={(e) => setSelectedV2Index(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {versions.map((ver, idx) => (
                <option key={ver._id} value={idx}>
                  Version {ver.versionNumber} ({ver.status}) - {ver.changeSummary.slice(0, 40)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Card 1 */}
          <VersionCard version={v1} getStatusBadge={getStatusBadge} label="Version A" />

          {/* Card 2 */}
          <div className="pt-6 md:pt-0 md:pl-6">
            <VersionCard version={v2} getStatusBadge={getStatusBadge} label="Version B" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Revisions are automatically captured whenever the AI Orchestrator executes a replanning trigger.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

const VersionCard = ({ version, getStatusBadge, label }) => {
  if (!version) return null;
  const plan = version.planData || {};
  const summary = plan.summary || {};
  const budget = plan.budgetEstimation || {};
  const venue = plan.venueAllocation?.[0];
  const conflicts = plan.conflicts || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            {label}
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Revision {version.versionNumber}
          </h4>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
            version.status
          )}`}
        >
          {version.status}
        </span>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Change Log:</span>
        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
          {version.changeSummary || 'Initial blueprint creation'}
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block">
          Timestamp: {new Date(version.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[10px] text-slate-400 block">Feasibility Score</span>
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            {summary.feasibilityScore || 85} / 100
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[10px] text-slate-400 block">Total Est. Cost</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ${budget.totalEstimatedCost?.toLocaleString() || summary.estimatedTotalCost || 0}
          </span>
        </div>
      </div>

      {/* Primary Venue */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Allocated Venue
        </span>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {venue?.venueName || 'Unassigned'}
          </span>
          <span className="text-[11px] text-slate-500">
            Cap: {venue?.capacity || 'N/A'} (Util: {venue?.utilizationPercentage || 0}%)
          </span>
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Schedule ({plan.schedule?.length || 0} Slots)
        </span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {plan.schedule?.map((s, i) => (
            <div
              key={i}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] flex items-center justify-between"
            >
              <span className="font-medium truncate max-w-[180px]">{s.activity}</span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {s.startTime} - {s.endTime}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Conflicts Count */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Identified Conflicts ({conflicts.length})
        </span>
        {conflicts.length === 0 ? (
          <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> No conflicts identified
          </span>
        ) : (
          <div className="space-y-1 text-[11px]">
            {conflicts.map((c, i) => (
              <div
                key={i}
                className="text-amber-600 dark:text-amber-400 flex items-start gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanVersionCompareModal;
