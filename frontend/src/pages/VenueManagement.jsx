import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Users,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';

const VenueManagement = () => {
  const { role } = useAuth();
  const canManage = role === 'Coordinator' || role === 'Venue Team';

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: '',
    building: '',
    capacity: 200,
    type: 'Auditorium',
    facilities: 'Line Array Audio, 4K Projector, Central AC',
    currentStatus: 'Available',
    hourlyRate: 100,
  });

  const loadVenues = async () => {
    try {
      setLoading(true);
      const res = await api.getVenues();
      if (res.success) {
        setVenues(res.data);
      }
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const handleToggleStatus = async (venue) => {
    if (!canManage) return;
    const nextStatus = venue.currentStatus === 'Available' ? 'Maintenance' : 'Available';
    try {
      await api.updateVenue(venue._id, { currentStatus: nextStatus });
      await loadVenues();
    } catch (err) {
      alert(`Update error: ${err.message}`);
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newVenue,
        capacity: Number(newVenue.capacity),
        hourlyRate: Number(newVenue.hourlyRate),
        facilities: newVenue.facilities.split(',').map((f) => f.trim()),
      };
      await api.createVenue(payload);
      setIsModalOpen(false);
      setNewVenue({
        name: '',
        building: '',
        capacity: 200,
        type: 'Auditorium',
        facilities: 'Line Array Audio, 4K Projector, Central AC',
        currentStatus: 'Available',
        hourlyRate: 100,
      });
      await loadVenues();
    } catch (err) {
      alert(`Create error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Campus Venues & Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time occupancy status, capacities, and maintenance schedules monitored by the Venue Agent
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Add Campus Venue
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading campus venue data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => {
            const isMaint = venue.currentStatus === 'Maintenance';
            return (
              <div
                key={venue._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {venue.type}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(venue)}
                      disabled={!canManage}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                        isMaint
                          ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      }`}
                      title={canManage ? 'Click to toggle status (simulates campus maintenance)' : ''}
                    >
                      {venue.currentStatus} {canManage ? '(Toggle)' : ''}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Building: {venue.building}
                  </p>

                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capacity</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {venue.capacity} Seats
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rate</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ${venue.hourlyRate}/hr
                      </span>
                    </div>
                  </div>

                  {venue.facilities?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Equipped Facilities:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {venue.facilities.map((fac, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Contact: {venue.contactPerson?.name || 'Facilities Desk'}</span>
                  <span>{venue.contactPerson?.phone || 'Ext 4100'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Venue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Campus Venue
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Venue Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Wing Auditorium"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Campus Building
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Block B"
                  value={newVenue.building}
                  onChange={(e) => setNewVenue({ ...newVenue, building: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={newVenue.capacity}
                    onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Venue Type
                  </label>
                  <select
                    value={newVenue.type}
                    onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Auditorium">Auditorium</option>
                    <option value="Seminar Hall">Seminar Hall</option>
                    <option value="Open Ground">Open Ground</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Sports Complex">Sports Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Equipped Facilities (comma separated)
                </label>
                <input
                  type="text"
                  value={newVenue.facilities}
                  onChange={(e) => setNewVenue({ ...newVenue, facilities: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueManagement;
