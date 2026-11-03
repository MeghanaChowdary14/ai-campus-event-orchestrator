import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  CheckSquare,
  Building2,
  Package,
  Bell,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuth();
  const isCoordinator = role === 'Coordinator';

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Campus Events', icon: CalendarDays },
    ...(isCoordinator
      ? [{ to: '/events/create', label: 'Plan New Event', icon: PlusCircle, highlight: true }]
      : []),
    { to: '/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/venues', label: 'Campus Venues', icon: Building2 },
    { to: '/resources', label: 'Resource Stock', icon: Package },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <div className="mb-4 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Campus Orchestration
        </div>

        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : link.highlight
                      ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 bg-indigo-50/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Multi-Agent Architecture Status Widget */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              AI Agent Engine
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-100">
            7 Active Sub-Agents
          </p>
          <div className="mt-2 text-[10px] text-slate-300 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span>Planning & Venue:</span>
              <span className="text-emerald-400">Synchronized</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Schedule & Resource:</span>
              <span className="text-emerald-400">Audited</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Conflict & Tasks:</span>
              <span className="text-emerald-400">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
