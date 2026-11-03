const Event = require('../models/Event');
const Task = require('../models/Task');
const EventPlanVersion = require('../models/EventPlanVersion');
const Notification = require('../models/Notification');
const Venue = require('../models/Venue');

// @desc    Get comprehensive dashboard metrics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const now = new Date();

    // 1. Event Counts
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ startDate: { $gte: now } });
    const completedEvents = await Event.countDocuments({ status: 'Completed' });
    const pendingApprovals = await Event.countDocuments({ status: 'Under Review' });

    // 2. Task metrics
    let taskFilter = {};
    if (role !== 'Coordinator') {
      taskFilter.assignedTeam = role;
    }

    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'In Progress' });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: 'Pending' });
    const activeTasks = inProgressTasks + pendingTasks;

    const teamProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. Conflict alerts in active under review or in progress plans
    const activePlans = await EventPlanVersion.find({
      status: { $in: ['Under Review', 'Approved'] },
    }).select('planData.conflicts');

    let conflictAlerts = 0;
    activePlans.forEach(p => {
      if (p.planData && p.planData.conflicts) {
        conflictAlerts += p.planData.conflicts.filter(c => !c.resolved).length;
      }
    });

    // 4. Events by Category (for Recharts)
    const categoryAgg = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const eventsByCategory = categoryAgg.map(c => ({
      category: c._id || 'General',
      count: c.count,
    }));

    // 5. Task Status Distribution (for Pie/Donut Chart)
    const taskStatusDistribution = [
      { name: 'Pending', value: pendingTasks, color: '#f59e0b' },
      { name: 'In Progress', value: inProgressTasks, color: '#6366f1' },
      { name: 'Completed', value: completedTasks, color: '#10b981' },
    ];

    // 6. Team-wise progress breakdown
    const teams = ['Coordinator', 'Venue Team', 'Technical Team', 'Volunteer Team', 'Security Team'];
    const teamTaskProgress = [];

    for (const t of teams) {
      const tTotal = await Task.countDocuments({ assignedTeam: t });
      const tDone = await Task.countDocuments({ assignedTeam: t, status: 'Completed' });
      const tInProgress = await Task.countDocuments({ assignedTeam: t, status: 'In Progress' });
      const pct = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;

      teamTaskProgress.push({
        team: t,
        total: tTotal,
        completed: tDone,
        inProgress: tInProgress,
        pending: tTotal - (tDone + tInProgress),
        progress: pct,
      });
    }

    // 7. Recent notifications / activity
    const recentActivity = await Notification.find(
      role === 'Coordinator' ? {} : { $or: [{ recipientTeam: role }, { recipientTeam: 'All' }] }
    )
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('eventId', 'title');

    // 8. Upcoming event list / calendar items
    const upcomingList = await Event.find({ startDate: { $gte: now } })
      .sort({ startDate: 1 })
      .limit(6)
      .select('title category startDate endDate status expectedAttendees preferredVenues');

    // 9. Budget Overview
    const allEvents = await Event.find().select('budget title status');
    const totalBudgetSanctioned = allEvents.reduce((acc, ev) => acc + (ev.budget || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          upcomingEvents,
          completedEvents,
          pendingApprovals,
          activeTasks,
          conflictAlerts,
          teamProgress,
          totalBudgetSanctioned,
        },
        eventsByCategory,
        taskStatusDistribution,
        teamTaskProgress,
        recentActivity,
        upcomingList,
      },
    });
  } catch (err) {
    console.error('[Analytics Controller] error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboardStats,
};
