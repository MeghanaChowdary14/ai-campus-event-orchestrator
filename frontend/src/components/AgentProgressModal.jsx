import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const AGENT_STEPS = [
  {
    name: 'Planning Agent',
    desc: 'Analyzing event parameters, student cohort scale, and formulating budget baseline...',
    icon: '⚡',
  },
  {
    name: 'Venue Agent',
    desc: 'Verifying campus venue capacities, acoustics, and double-booking calendar state...',
    icon: '🏛️',
  },
  {
    name: 'Schedule Agent',
    desc: 'Synthesizing conflict-free chronological schedule with 15-min stage buffers...',
    icon: '⏱️',
  },
  {
    name: 'Resource Agent',
    desc: 'Calculating required 4K projectors, wireless mics, Wi-Fi 6 access points & crew...',
    icon: '📦',
  },
  {
    name: 'Conflict Detection Agent',
    desc: 'Executing multi-dimensional conflict detection across venues, budgets, and stock...',
    icon: '⚠️',
  },
  {
    name: 'Task Assignment Agent',
    desc: 'Partitioning operational deliverables across Venue, Tech, Volunteer & Security teams...',
    icon: '📋',
  },
  {
    name: 'Notification Agent',
    desc: 'Drafting targeted departmental advisories and coordinator approval alerts...',
    icon: '🔔',
  },
];

const AgentProgressModal = ({ isOpen, isComplete, onFinish, currentAgentIndex = 0 }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      return;
    }

    // Progress simulation through the 7 agents
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < AGENT_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const allFinished = isComplete || activeStep >= AGENT_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  Multi-Agent AI Orchestration in Progress
                </h3>
                <p className="text-xs text-indigo-200">
                  7 Autonomous AI Agents collaborating on your event blueprint
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Step Progression */}
        <div className="p-6 max-h-[420px] overflow-y-auto space-y-3">
          {AGENT_STEPS.map((step, idx) => {
            const isDone = idx < activeStep || (idx === activeStep && allFinished);
            const isCurrent = idx === activeStep && !allFinished;
            const isWaiting = idx > activeStep;

            return (
              <div
                key={step.name}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                    : isDone
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                    : 'border-slate-100 dark:border-slate-800/50 opacity-40'
                }`}
              >
                <div className="text-xl mt-0.5 shrink-0">{step.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {step.name}
                    </span>
                    {isDone && (
                      <span className="text-emerald-500 text-xs flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-4 h-4" /> Synthesized
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Orchestrating...
                      </span>
                    )}
                    {isWaiting && (
                      <span className="text-slate-400 text-[11px]">Queued</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {allFinished ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Master plan compiled successfully!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                Aggregating agent outputs into structured plan...
              </span>
            )}
          </div>
          {allFinished && (
            <button
              onClick={onFinish}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition"
            >
              View Plan Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentProgressModal;
