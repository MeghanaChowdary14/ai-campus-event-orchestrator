import React, { useState } from 'react';
import { Edit3, X, Save, Plus, Trash2, Clock, DollarSign } from 'lucide-react';

const EditPlanModal = ({ isOpen, onClose, onSave, planData }) => {
  const [schedule, setSchedule] = useState(planData?.schedule || []);
  const [budget, setBudget] = useState(planData?.budgetEstimation || {});
  const [recommendations, setRecommendations] = useState(planData?.recommendations || []);
  const [newRec, setNewRec] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleAddRec = () => {
    if (newRec.trim()) {
      setRecommendations([...recommendations, newRec.trim()]);
      setNewRec('');
    }
  };

  const handleRemoveRec = (index) => {
    setRecommendations(recommendations.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave({
        schedule,
        budgetEstimation: budget,
        recommendations,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save manual plan edits:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Coordinator Plan Refinement
              </h3>
              <p className="text-xs text-slate-500">
                Manually fine-tune schedule slots, contingency funds, and recommendations
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Schedule slots */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Activity Schedule Timetable
            </h4>
            <div className="space-y-3">
              {schedule.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] text-slate-400">Activity</label>
                    <input
                      type="text"
                      value={slot.activity}
                      onChange={(e) => handleScheduleChange(index, 'activity', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400">Start</label>
                    <input
                      type="text"
                      value={slot.startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400">End</label>
                    <input
                      type="text"
                      value={slot.endTime}
                      onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400">Lead Team</label>
                    <select
                      value={slot.leadTeam}
                      onChange={(e) => handleScheduleChange(index, 'leadTeam', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="Coordinator">Coordinator</option>
                      <option value="Venue Team">Venue Team</option>
                      <option value="Technical Team">Technical Team</option>
                      <option value="Volunteer Team">Volunteer Team</option>
                      <option value="Security Team">Security Team</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Coordinator & AI Action Recommendations
            </h4>
            <div className="space-y-2 mb-3">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="truncate pr-2">• {rec}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRec(i)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom directive or contingency note..."
                value={newRec}
                onChange={(e) => setNewRec(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={handleAddRec}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> Save Plan Adjustments
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;
