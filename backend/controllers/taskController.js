const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Get tasks (filtered by role, event, status, team)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { eventId, assignedTeam, status, priority } = req.query;
    const filter = {};

    // Role-based visibility:
    // If not Coordinator, default filter to user's assigned team unless explicitly querying all or allowed
    if (req.user.role !== 'Coordinator') {
      filter.assignedTeam = req.user.role;
    } else if (assignedTeam && assignedTeam !== 'all') {
      filter.assignedTeam = assignedTeam;
    }

    if (eventId) {
      filter.eventId = eventId;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const tasks = await Task.find(filter)
      .populate('eventId', 'title category startDate endDate status')
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email role')
      .sort({ deadline: 1, priority: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error('[Task Controller] getTasks error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('eventId')
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check: Team members can only view their own team's tasks or coordinators can view all
    if (req.user.role !== 'Coordinator' && task.assignedTeam !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not belong to the assigned team (${task.assignedTeam}).`,
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create manual task
// @route   POST /api/tasks
// @access  Private (Coordinator)
const createTask = async (req, res) => {
  try {
    const { title, description, eventId, assignedTeam, priority, deadline, assignedTo } = req.body;

    if (!title || !eventId || !assignedTeam || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title, event ID, assigned team, and deadline.',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      eventId,
      assignedTeam,
      priority: priority || 'Medium',
      deadline: new Date(deadline),
      assignedTo: assignedTo || null,
      status: 'Pending',
      progress: 0,
      createdBy: req.user._id,
    });

    // Notify assigned team
    await Notification.create({
      recipientTeam: assignedTeam,
      title: `New Task Assigned: "${title}"`,
      message: `Priority: ${priority || 'Medium'}. Deadline: ${new Date(deadline).toLocaleDateString()}.`,
      type: 'task_assignment',
      eventId,
      taskId: task._id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (err) {
    console.error('[Task Controller] createTask error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update task status, progress, notes
// @route   PUT /api/tasks/:id
// @access  Private (Coordinator or Assigned Team Member)
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Role check: Only Coordinator or member of assignedTeam can update
    if (req.user.role !== 'Coordinator' && task.assignedTeam !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only members of "${task.assignedTeam}" or Coordinators may update this task.`,
      });
    }

    const { status, progress, noteText, priority, assignedTo } = req.body;

    if (status) {
      task.status = status;
      if (status === 'Completed') {
        task.progress = 100;
      } else if (status === 'In Progress' && task.progress === 0) {
        task.progress = 25;
      }
    }

    if (progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, Number(progress)));
      if (task.progress === 100) {
        task.status = 'Completed';
      }
    }

    if (priority && req.user.role === 'Coordinator') {
      task.priority = priority;
    }

    if (assignedTo && req.user.role === 'Coordinator') {
      task.assignedTo = assignedTo;
    }

    if (noteText && noteText.trim()) {
      task.notes.push({
        author: req.user._id,
        authorName: `${req.user.name} (${req.user.role})`,
        text: noteText.trim(),
        timestamp: new Date(),
      });
    }

    await task.save();

    // If completed or progress updated, notify Coordinator
    if (status === 'Completed') {
      await Notification.create({
        recipientTeam: 'Coordinator',
        title: `Task Completed: "${task.title}"`,
        message: `Team "${task.assignedTeam}" completed this task on ${new Date().toLocaleDateString()}.`,
        type: 'status_update',
        eventId: task.eventId,
        taskId: task._id,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('eventId', 'title category')
      .populate('assignedTo', 'name email role department');

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (err) {
    console.error('[Task Controller] updateTaskStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete task (Coordinator only)
// @route   DELETE /api/tasks/:id
// @access  Private (Coordinator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
};
