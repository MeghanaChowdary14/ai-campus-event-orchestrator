import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AgentProgressModal from '../components/AgentProgressModal';
import {
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Plus,
  Trash2,
  Building2,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  'Tech Symposium',
  'Hackathon',
  'Cultural Fest',
  'Sports Meet',
  'Workshop',
  'Seminar',
  'Guest Lecture',
  'Exhibition',
  'Conference',
  'Other',
];

const EventCreate = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tech Symposium',
    expectedAttendees: 250,
    durationHours: 6,
    startDate: '',
    endDate: '',
    budget: 5000,
    numberOfActivities: 2,
    preferredVenues: [],
    specialRequirements: '',
  });

  const [activities, setActivities] = useState([
    { name: 'Keynote & Research Paper Presentations', durationMinutes: 90, preferredVenue: '', description: '' },
    { name: 'Technical Project Expo & Panel Evaluation', durationMinutes: 120, preferredVenue: '', description: '' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Set default dates: 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    const startIso = d.toISOString().slice(0, 16);

    const endD = new Date(d.getTime() + 6 * 60 * 60 * 1000);
    const endIso = endD.toISOString().slice(0, 16);

    setFormData((prev) => ({
      ...prev,
      startDate: startIso,
      endDate: endIso,
    }));

    // Fetch venues for multiselect
    const loadVenues = async () => {
      try {
        const res = await api.getVenues();
        if (res.success) {
          setVenues(res.data);
        }
      } catch (err) {
        console.error('Failed to load campus venues:', err);
      }
    };
    loadVenues();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (index, field, value) => {
    const updated = [...activities];
    updated[index][field] = value;
    setActivities(updated);
  };

  const addActivity = () => {
    setActivities([
      ...activities,
      { name: '', durationMinutes: 60, preferredVenue: '', description: '' },
    ]);
    setFormData((prev) => ({ ...prev, numberOfActivities: activities.length + 1 }));
  };

  const removeActivity = (index) => {
    if (activities.length > 1) {
      const updated = activities.filter((_, idx) => idx !== index);
      setActivities(updated);
      setFormData((prev) => ({ ...prev, numberOfActivities: updated.length }));
    }
  };

  const toggleVenuePreference = (venueName) => {
    setFormData((prev) => {
      const exists = prev.preferredVenues.includes(venueName);
      return {
        ...prev,
        preferredVenues: exists
          ? prev.preferredVenues.filter((v) => v !== venueName)
          : [...prev.preferredVenues, venueName],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Please provide event name, start date, and end date.');
      return;
    }

    try {
      setSubmitting(true);
      setIsModalOpen(true);
      setIsComplete(false);

      const payload = {
        ...formData,
        expectedAttendees: Number(formData.expectedAttendees),
        durationHours: Number(formData.durationHours),
        budget: Number(formData.budget),
        numberOfActivities: activities.length,
        activities: activities.map((a, i) => ({
          ...a,
          durationMinutes: Number(a.durationMinutes) || 60,
          order: i + 1,
        })),
        autoGeneratePlan: true,
      };

      const res = await api.createEvent(payload);
      if (res.success && res.data) {
        setCreatedEventId(res.data._id);
        // Let the modal run its animation sequence
        setTimeout(() => {
          setIsComplete(true);
        }, 3200);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize AI planning workflow.');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishModal = () => {
    setIsModalOpen(false);
    if (createdEventId) {
      navigate(`/events/${createdEventId}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 flex items-center gap-1.5 font-mono w-max mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Multi-Agent AI Intake
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Create Campus Event & Generate AI Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Input the event parameters below. The 7 AI Sub-Agents will synthesize schedules, match venue capacities, compute hardware requirements, detect conflicts, and distribute team tasks.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> 1. Event Overview & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. National Robotics & Autonomous Systems Symposium 2026"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Description & Objectives
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Describe key outcomes, target audiences, and theme for the AI Planning Agent..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scale, Schedule & Budget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> 2. Scale, Timeline & Fiscal Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Students (Attendees) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="expectedAttendees"
                  required
                  min={1}
                  value={formData.expectedAttendees}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">students</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event Duration <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="durationHours"
                  required
                  min={1}
                  value={formData.durationHours}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">hours</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Available Budget <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  name="budget"
                  required
                  min={0}
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Per-Attendee Allowance
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs font-mono text-slate-600 dark:text-slate-400">
                ${(formData.budget / (formData.expectedAttendees || 1)).toFixed(2)} / student
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Activities Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> 3. Sub-Activities & Sessions ({activities.length})
              </h2>
              <p className="text-xs text-slate-500">
                Schedule Agent will sequence these and insert required buffers
              </p>
            </div>
            <button
              type="button"
              onClick={addActivity}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Activity Name #{index + 1}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Opening Keynote, Hack sprint..."
                    value={act.name}
                    onChange={(e) => handleActivityChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={act.durationMinutes}
                    onChange={(e) => handleActivityChange(index, 'durationMinutes', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Preferred Location
                  </label>
                  <select
                    value={act.preferredVenue}
                    onChange={(e) => handleActivityChange(index, 'preferredVenue', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  >
                    <option value="">AI Auto-Allocate</option>
                    {venues.map((v) => (
                      <option key={v._id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  {activities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition"
                      title="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Preferred Venues & Special Requirements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> 4. Campus Venue Preferences & Special Logistics
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Preferred Campus Venues (Venue Agent will verify capacity & avoid double-bookings):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {venues.map((venue) => {
                const selected = formData.preferredVenues.includes(venue.name);
                const isUnderMaintenance = venue.currentStatus === 'Maintenance';
                return (
                  <button
                    type="button"
                    key={venue._id}
                    onClick={() => toggleVenuePreference(venue.name)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : isUnderMaintenance
                        ? 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-800/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{venue.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Cap: {venue.capacity} • {venue.building}
                      </span>
                    </div>
                    {isUnderMaintenance ? (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                        Maint.
                      </span>
                    ) : selected ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Special Technical or VIP Requirements
            </label>
            <textarea
              name="specialRequirements"
              rows={2}
              placeholder="e.g. 4K live stream to YouTube, VIP faculty dinner protocol, wheelchair ramps, dedicated 5G wireless SSID..."
              value={formData.specialRequirements}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Submission Action */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-extrabold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Generate AI Event Plan
          </button>
        </div>
      </form>

      {/* Multi-Agent Orchestration Visual Modal */}
      <AgentProgressModal
        isOpen={isModalOpen}
        isComplete={isComplete}
        onFinish={handleFinishModal}
      />
    </div>
  );
};

export default EventCreate;
