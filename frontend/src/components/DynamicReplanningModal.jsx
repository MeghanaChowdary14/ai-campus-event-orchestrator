import React, { useState } from 'react';
import { RefreshCw, X, AlertTriangle, Building2, Calendar, MessageSquare, Loader2 } from 'lucide-react';

const DynamicReplanningModal = ({ isOpen, onClose, onReplan, event, venues = [] }) => {
  const [triggerReason, setTriggerReason] = useState('Venue maintenance conflict detected');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [startDate, setStartDate] = useState(event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '');
  const [endDate, setEndDate] = useState(event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onReplan({
        triggerReason,
        updatedVenue: selectedVenue || undefined,
        updatedStartDate: startDate || undefined,
        updatedEndDate: endDate || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Replanning error:', err);
    } finally {
      setLoading(false);
    }
  };

  const presetReasons = [
    'Primary venue scheduled for emergency maintenance',
    'Attendee registration overflow exceeded room capacity',
    'Schedule clash with institute guest lecture',
    'AV equipment shortage requiring alternative facility',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Dynamic AI Replanning</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger multi-agent recalibration with adjusted constraints
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Replanning Trigger Reason
            </label>
            <input
              type="text"
              required
              value={triggerReason}
              onChange={(e) => setTriggerReason(e.target.value)}
              placeholder="e.g. Main Auditorium AC failure, unexpected conflict..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetReasons.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setTriggerReason(preset)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Switch Alternative Venue (Optional)
            </label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Keep / Let Venue Agent recommend optimal facility</option>
              {venues
                .filter((v) => v.currentStatus !== 'Maintenance')
                .map((v) => (
                  <option key={v._id} value={v.name}>
                    {v.name} (Cap: {v.capacity}) - {v.building}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Adjusted Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Adjusted End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-slate-600 dark:text-slate-400">
            💡 <strong>Dynamic Workflow:</strong> Triggers Venue Agent to re-evaluate capacity fit, Schedule Agent to shift timetables, and Resource Agent to recalculate gear for the new setup. Previous version is saved in version history.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Replanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" /> Execute Dynamic Replanning
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicReplanningModal;
