import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Layers,
  Wrench,
  AlertTriangle,
  Plus,
  Minus,
  X,
  Search,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = ['all', 'AudioVisual', 'Furniture', 'Network', 'Safety', 'Stage', 'Signage'];

const ResourceInventory = () => {
  const { role } = useAuth();
  const canManage = role === 'Coordinator' || role === 'Technical Team';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'AudioVisual',
    totalStock: 10,
    availableStock: 10,
    unit: 'units',
    unitCost: 50,
    condition: 'Optimal',
    location: 'Central Campus Logistics Depot',
  });

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;

      const res = await api.getResources(params);
      if (res.success) {
        setResources(res.data);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [activeCategory]);

  const handleStockAdjust = async (resource, delta) => {
    if (!canManage) return;
    const nextAvailable = Math.max(0, Math.min(resource.totalStock, resource.availableStock + delta));
    try {
      await api.updateResource(resource._id, { availableStock: nextAvailable });
      await loadResources();
    } catch (err) {
      alert(`Adjustment error: ${err.message}`);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.createResource(newResource);
      setIsModalOpen(false);
      setNewResource({
        name: '',
        category: 'AudioVisual',
        totalStock: 10,
        availableStock: 10,
        unit: 'units',
        unitCost: 50,
        condition: 'Optimal',
        location: 'Central Campus Logistics Depot',
      });
      await loadResources();
    } catch (err) {
      alert(`Create error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Resource Stock & Equipment Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitored by Resource Agent to estimate shortages and budget expenditure
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Add Hardware / Supply
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Inventory' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading campus inventory logs...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const stockPct = Math.round((item.availableStock / (item.totalStock || 1)) * 100);
            const isLow = stockPct < 30;

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLow
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.availableStock} / {item.totalStock} {item.unit}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Location: {item.location}
                  </p>

                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Unit Cost</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ${item.unitCost}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Condition</span>
                      <span className="font-extrabold text-emerald-600">
                        {item.condition}
                      </span>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Available Stock</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {stockPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-indigo-600'}`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Quick Adjustment */}
                {canManage && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Simulate Deficit:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStockAdjust(item, -2)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition"
                        title="Reduce stock by 2 (simulate shortage)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStockAdjust(item, 2)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition"
                        title="Add stock by 2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Inventory Item
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Resource Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Lavalier Mics"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Category
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Total Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newResource.totalStock}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        totalStock: Number(e.target.value),
                        availableStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newResource.unitCost}
                    onChange={(e) => setNewResource({ ...newResource, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Depot Location
                  </label>
                  <input
                    type="text"
                    value={newResource.location}
                    onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
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
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceInventory;
