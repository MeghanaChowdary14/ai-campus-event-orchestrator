import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  MoreVertical,
  Calendar,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  X,
  Send,
} from 'lucide-react';

const TEAMS = ['all', 'Coordinator', 'Venue Team', 'Technical Team', 'Volunteer Team', 'Security Team'];
const PRIORITIES = ['all', 'Critical', 'High', 'Medium', 'Low'];

const TaskManagement = () => {
  const { role, user } = useAuth();
  const isCoordinator = role === 'Coordinator';

  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTeam, setSelectedTeam] = useState(isCoordinator ? 'all' : role);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  // Modals
  const [activeTask, setActiveTask] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create task modal (Coordinator only)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    eventId: '',
    assignedTeam: 'Venue Team',
    priority: 'Medium',
    deadline: '',
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedTeam !== 'all') params.assignedTeam = selectedTeam;
      if (selectedPriority !== 'all') params.priority = selectedPriority;

      const res = await api.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }

      const evRes = await api.getEvents();
      if (evRes.success) {
        setEvents(evRes.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedTeam, selectedPriority]);

  const handleUpdateStatus = async (taskId, newStatus, newProgress) => {
    try {
      setUpdating(true);
      const payload = { status: newStatus };
      if (newProgress !== undefined) payload.progress = newProgress;
      else if (newStatus === 'Completed') payload.progress = 100;
      else if (newStatus === 'In Progress' && (!activeTask || activeTask.progress === 0)) payload.progress = 50;

      await api.updateTaskStatus(taskId, payload);
      await loadTasks();

      if (activeTask && activeTask._id === taskId) {
        setActiveTask((prev) => ({
          ...prev,
          status: newStatus,
          progress: payload.progress !== undefined ? payload.progress : prev.progress,
        }));
      }
    } catch (err) {
      alert(`Update error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !activeTask) return;
    try {
      setUpdating(true);
      await api.updateTaskStatus(activeTask._id, { noteText: newNote.trim() });
      setNewNote('');
      const res = await api.getTaskById(activeTask._id);
      if (res.success) {
        setActiveTask(res.data);
      }
      await loadTasks();
    } catch (err) {
      alert(`Note error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.createTask(newTaskData);
      setIsCreateOpen(false);
      setNewTaskData({
        title: '',
        description: '',
        eventId: '',
        assignedTeam: 'Venue Team',
        priority: 'Medium',
        deadline: '',
      });
      await loadTasks();
    } catch (err) {
      alert(`Task creation error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      return (
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.eventId?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const pendingTasks = filteredTasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Campus Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational deliverables dispatched from approved AI event blueprints
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-4 h-4" /> Table
            </button>
          </div>

          {isCoordinator && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Team Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Team:</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All Campus Teams' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Priorities' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading team task queues...
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Pending */}
          <KanbanColumn
            title="Pending Dispatch"
            count={pendingTasks.length}
            tasks={pendingTasks}
            status="Pending"
            color="amber"
            onTaskClick={setActiveTask}
            getPriorityColor={getPriorityColor}
          />

          {/* Column 2: In Progress */}
          <KanbanColumn
            title="In Progress"
            count={inProgressTasks.length}
            tasks={inProgressTasks}
            status="In Progress"
            color="indigo"
            onTaskClick={setActiveTask}
            getPriorityColor={getPriorityColor}
          />

          {/* Column 3: Completed */}
          <KanbanColumn
            title="Completed"
            count={completedTasks.length}
            tasks={completedTasks}
            status="Completed"
            color="emerald"
            onTaskClick={setActiveTask}
            getPriorityColor={getPriorityColor}
          />
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="p-3 rounded-l-xl">Task Title & Event</th>
                <th className="p-3">Assigned Team</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Deadline</th>
                <th className="p-3 text-center">Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {t.eventId?.title || 'Campus Event'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                    {t.assignedTeam}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {new Date(t.deadline).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-indigo-600">{t.progress}%</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveTask(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Inspection & Status Update Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">
                  {activeTask.assignedTeam}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeTask.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeTask.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Event Linked</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {activeTask.eventId?.title || 'Campus Event'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Target Deadline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(activeTask.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                  Update Task Status & Progress
                </span>
                <div className="flex items-center gap-2">
                  {['Pending', 'In Progress', 'Completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating || (!isCoordinator && activeTask.assignedTeam !== role)}
                      onClick={() => handleUpdateStatus(activeTask._id, st)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                        activeTask.status === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {!isCoordinator && activeTask.assignedTeam !== role && (
                  <p className="text-[10px] text-amber-600">
                    ⚠️ You can only update tasks assigned to your role ({role}).
                  </p>
                )}
              </div>

              {/* Notes / Team Comments Thread */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Team Activity & Verification Notes ({activeTask.notes?.length || 0})
                </span>

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {activeTask.notes?.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No notes logged yet.</p>
                  ) : (
                    activeTask.notes?.map((n, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {n.authorName || 'Team Member'}
                          </span>
                          <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log status note or inspection report..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={updating || !newNote.trim()}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Task Creation Modal (Coordinator Only) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dispatch New Campus Task
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct soundcheck dry run"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Event
                </label>
                <select
                  required
                  value={newTaskData.eventId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, eventId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value="">Select an Event...</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Assigned Team
                  </label>
                  <select
                    value={newTaskData.assignedTeam}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assignedTeam: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {TEAMS.filter((t) => t !== 'all').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                    Priority
                  </label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    {PRIORITIES.filter((p) => p !== 'all').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Deadline
                </label>
                <input
                  type="date"
                  required
                  value={newTaskData.deadline}
                  onChange={(e) => setNewTaskData({ ...newTaskData, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanColumn = ({ title, count, tasks, status, color, onTaskClick, getPriorityColor }) => {
  const headerColors = {
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200',
    indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200',
  };

  return (
    <div className="bg-slate-100/70 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-800/60 flex flex-col min-h-[500px]">
      <div className={`p-3 rounded-2xl border ${headerColors[color]} flex items-center justify-between mb-4`}>
        <span className="text-xs font-bold">{title}</span>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-xs">
          {count}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No tasks in this lane</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              onClick={() => onTaskClick(task)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {task.assignedTeam}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                {task.title}
              </h4>

              <p className="text-[11px] text-slate-500 line-clamp-2">
                {task.description}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                {task.notes?.length > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-slate-500">
                    <MessageSquare className="w-3 h-3" /> {task.notes.length}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
