import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, Building2, Wrench, Users, ShieldAlert, Check } from 'lucide-react';

const QuickRoleSwitcher = () => {
  const { role, quickSwitchRole } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { name: 'Coordinator', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { name: 'Venue Team', icon: Building2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Technical Team', icon: Wrench, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'Volunteer Team', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Security Team', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  const handleSwitch = async (targetRole) => {
    if (targetRole === role || switching) return;
    try {
      setSwitching(true);
      await quickSwitchRole(targetRole);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setSwitching(false);
    }
  };

  const currentRoleObj = roles.find(r => r.name === role) || roles[0];
  const Icon = currentRoleObj.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:border-indigo-400 transition"
        title="Quick Role Switcher for Testing"
      >
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">Role:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{role || 'Select'}</span>
        </span>
        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">
          Switch
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-in fade-in duration-150">
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Role-Based Access Switcher
            </p>
            <p className="text-[10px] text-slate-500">
              Switch role instantly to test views and permissions
            </p>
          </div>
          <div className="space-y-1">
            {roles.map((r) => {
              const RoleIcon = r.icon;
              const isCurrent = r.name === role;
              return (
                <button
                  key={r.name}
                  onClick={() => handleSwitch(r.name)}
                  disabled={switching}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RoleIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{r.name}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickRoleSwitcher;
