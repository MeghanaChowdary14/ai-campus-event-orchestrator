import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, Bot, Sparkles, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Branding & Agent Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              AI Campus Event Orchestrator
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Bot className="w-3 h-3" /> Multi-Agent AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Autonomous College Event Planning & Resource Dispatch
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Role:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.role}</span>
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Card & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
              {user?.department}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
