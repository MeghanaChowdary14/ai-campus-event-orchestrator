const Event = require('../models/Event');
const EventPlanVersion = require('../models/EventPlanVersion');
const Task = require('../models/Task');
const Venue = require('../models/Venue');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const aiOrchestrator = require('../ai/orchestrator');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('currentPlan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error('[Event Controller] getEvents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get event by ID with current plan and version history
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('currentPlan');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with given ID.',
      });
    }

    // Fetch version history
    const versions = await EventPlanVersion.find({ eventId: event._id })
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ versionNumber: -1 });

    res.json({
      success: true,
      data: {
        event,
        versions,
      },
    });
  } catch (err) {
    console.error('[Event Controller] getEventById error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new event (Coordinator only)
// @route   POST /api/events
// @access  Private (Coordinator)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      expectedAttendees,
      durationHours,
      startDate,
      endDate,
      budget,
      numberOfActivities,
      activities,
      preferredVenues,
      specialRequirements,
      autoGeneratePlan = true,
    } = req.body;

    if (!title || !expectedAttendees || !startDate || !endDate || budget === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event title, expected attendees, start date, end date, and budget.',
      });
    }

    const event = await Event.create({
      title,
      description: description || '',
      category: category || 'Tech Symposium',
      expectedAttendees: Number(expectedAttendees),
      durationHours: Number(durationHours) || 4,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: Number(budget),
      numberOfActivities: numberOfActivities || (activities ? activities.length : 1),
      activities: activities || [{ name: 'Main Session', durationMinutes: 60, order: 1 }],
      preferredVenues: preferredVenues || [],
      specialRequirements: specialRequirements || '',
      status: 'Draft',
      createdBy: req.user._id,
    });

    // If autoGeneratePlan is requested, trigger Multi-Agent Orchestrator immediately
    if (autoGeneratePlan) {
      const dbVenues = await Venue.find();
      const dbResources = await Resource.find();
      const existingEvents = await Event.find({ _id: { $ne: event._id } });

      const orchestrationResult = await aiOrchestrator.orchestrate(event, {
        dbVenues,
        dbResources,
        existingEvents,
      });

      // Save initial EventPlanVersion
      const planVersion = await EventPlanVersion.create({
        eventId: event._id,
        versionNumber: 1,
        status: 'Under Review',
        changeSummary: 'Initial Multi-Agent Orchestrated Plan',
        planData: orchestrationResult.planData,
        generatedBy: req.user._id,
      });

      // Link plan to event
      event.currentPlan = planVersion._id;
      event.status = 'Under Review';
      await event.save();

      // Create notifications for coordinator & teams
      if (orchestrationResult.notifications && orchestrationResult.notifications.length > 0) {
        for (const notif of orchestrationResult.notifications) {
          await Notification.create({
            recipientTeam: notif.recipientTeam,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            eventId: event._id,
          });
        }
      }

      const populatedEvent = await Event.findById(event._id)
        .populate('createdBy', 'name email role')
        .populate('currentPlan');

      return res.status(201).json({
        success: true,
        data: populatedEvent,
        plan: planVersion,
      });
    }

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error('[Event Controller] createEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Generate / Regenerate AI Plan for an event
// @route   POST /api/events/:id/generate-plan
// @access  Private (Coordinator)
const generatePlan = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const dbVenues = await Venue.find();
    const dbResources = await Resource.find();
    const existingEvents = await Event.find({ _id: { $ne: event._id } });

    const orchestrationResult = await aiOrchestrator.orchestrate(event, {
      dbVenues,
      dbResources,
      existingEvents,
    });

    // Determine next version number
    const latestVersion = await EventPlanVersion.findOne({ eventId: event._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Mark previous versions as superseded
    await EventPlanVersion.updateMany(
      { eventId: event._id, status: { $in: ['Draft', 'Under Review'] } },
      { $set: { status: 'Superseded' } }
    );

    const planVersion = await EventPlanVersion.create({
      eventId: event._id,
      versionNumber: nextVersionNumber,
      status: 'Under Review',
      changeSummary: `Regenerated Plan (Version ${nextVersionNumber})`,
      planData: orchestrationResult.planData,
      generatedBy: req.user._id,
    });

    event.currentPlan = planVersion._id;
    event.status = 'Under Review';
    await event.save();

    // Create notifications
    if (orchestrationResult.notifications) {
      for (const n of orchestrationResult.notifications) {
        await Notification.create({
          recipientTeam: n.recipientTeam,
          title: n.title,
          message: n.message,
          type: n.type,
          eventId: event._id,
        });
      }
    }

    res.json({
      success: true,
      message: 'AI multi-agent plan generated successfully.',
      data: planVersion,
    });
  } catch (err) {
    console.error('[Event Controller] generatePlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Dynamic Replanning when venue or schedule conflict occurs
// @route   POST /api/events/:id/replan
// @access  Private (Coordinator)
const replanEvent = async (req, res) => {
  try {
    const { triggerReason, updatedVenue, updatedStartDate, updatedEndDate } = req.body;
    const event = await Event.findById(req.params.id).populate('currentPlan');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Apply any dynamic changes to event
    if (updatedVenue) {
      event.preferredVenues = [updatedVenue];
    }
    if (updatedStartDate) {
      event.startDate = new Date(updatedStartDate);
    }
    if (updatedEndDate) {
      event.endDate = new Date(updatedEndDate);
    }
    await event.save();

    const dbVenues = await Venue.find();
    const dbResources = await Resource.find();
    const existingEvents = await Event.find({ _id: { $ne: event._id } });

    const previousPlanData = event.currentPlan ? event.currentPlan.planData : null;
    const replanResult = await aiOrchestrator.replan(
      event,
      previousPlanData,
      triggerReason || 'Dynamic Replanning Triggered by Coordinator',
      { dbVenues, dbResources, existingEvents }
    );

    const latestVersion = await EventPlanVersion.findOne({ eventId: event._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Mark previous active version as Superseded
    if (event.currentPlan) {
      await EventPlanVersion.findByIdAndUpdate(event.currentPlan._id, { status: 'Superseded' });
    }

    const newPlanVersion = await EventPlanVersion.create({
      eventId: event._id,
      versionNumber: nextVersionNumber,
      status: 'Under Review',
      changeSummary: replanResult.changeSummary || `Dynamic Replanning Version ${nextVersionNumber}`,
      planData: replanResult.planData,
      generatedBy: req.user._id,
    });

    event.currentPlan = newPlanVersion._id;
    event.status = 'Under Review';
    await event.save();

    // Send notifications to all teams about replanning
    const teams = ['Coordinator', 'Venue Team', 'Technical Team', 'Volunteer Team', 'Security Team'];
    for (const t of teams) {
      await Notification.create({
        recipientTeam: t,
        title: `🔄 Dynamic Replanning: "${event.title}" (v${nextVersionNumber})`,
        message: `Plan revision generated due to: "${triggerReason || 'Operational adjustments'}". Please review updated allocations.`,
        type: 'replanning',
        eventId: event._id,
      });
    }

    res.json({
      success: true,
      message: 'Dynamic replanning complete. Plan version updated.',
      data: newPlanVersion,
    });
  } catch (err) {
    console.error('[Event Controller] replanEvent error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Auto Resolve Conflicts
// @route   POST /api/events/:id/resolve-conflicts
// @access  Private (Coordinator)
const resolveConflicts = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('currentPlan');
    if (!event || !event.currentPlan) {
      return res.status(404).json({ success: false, message: 'Event or current plan not found.' });
    }

    const dbVenues = await Venue.find();
    const resolvedPlanData = await aiOrchestrator.resolveConflicts(
      event,
      event.currentPlan.planData,
      { dbVenues }
    );

    const updatedPlan = await EventPlanVersion.findByIdAndUpdate(
      event.currentPlan._id,
      {
        planData: resolvedPlanData,
        changeSummary: `${event.currentPlan.changeSummary} | Conflicts Auto-Resolved by AI`,
      },
      { new: true }
    );

    await Notification.create({
      recipientTeam: 'Coordinator',
      title: `Conflicts Cleared for "${event.title}"`,
      message: 'Automated AI conflict resolution resolved flagged venue and resource bottlenecks.',
      type: 'general',
      eventId: event._id,
    });

    res.json({
      success: true,
      message: 'Conflicts successfully resolved by AI Orchestrator.',
      data: updatedPlan,
    });
  } catch (err) {
    console.error('[Event Controller] resolveConflicts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve Plan and automatically generate tasks (Coordinator only)
// @route   POST /api/events/:id/approve-plan
// @access  Private (Coordinator)
const approvePlan = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('currentPlan');
    if (!event || !event.currentPlan) {
      return res.status(404).json({ success: false, message: 'Event or current plan not found.' });
    }

    // 1. Update Plan Version status
    event.currentPlan.status = 'Approved';
    event.currentPlan.approvedBy = req.user._id;
    await event.currentPlan.save();

    // 2. Update Event status
    event.status = 'Approved';
    event.approvedBy = req.user._id;
    await event.save();

    // 3. Automatically create tasks from AI plan
    const createdTasks = [];
    const context = {
      eventData: event,
      venueData: { primaryVenue: event.currentPlan.planData.venueAllocation[0]?.venueName },
      scheduleData: { schedule: event.currentPlan.planData.schedule },
      resourceData: { staffingNeeds: { volunteers: 10, technicalCrew: 4, securityOfficers: 5 } },
    };

    const taskAgent = require('../ai/agents/taskAssignmentAgent');
    const taskResult = await taskAgent.run(context);

    if (taskResult.data && taskResult.data.generatedTasks) {
      for (const t of taskResult.data.generatedTasks) {
        const created = await Task.create({
          title: t.title,
          description: t.description,
          eventId: event._id,
          planVersionId: event.currentPlan._id,
          assignedTeam: t.assignedTeam,
          priority: t.priority,
          deadline: t.deadline,
          status: 'Pending',
          createdBy: req.user._id,
        });
        createdTasks.push(created);
      }
    }

    // 4. Send approval notifications to all teams
    const teams = ['Venue Team', 'Technical Team', 'Volunteer Team', 'Security Team'];
    for (const team of teams) {
      await Notification.create({
        recipientTeam: team,
        title: `✅ Plan Approved: "${event.title}"`,
        message: `Coordinator has approved the AI event plan. Live tasks have been created and assigned to your team dashboard.`,
        type: 'task_assignment',
        eventId: event._id,
      });
    }

    res.json({
      success: true,
      message: 'Plan successfully approved and tasks deployed to all teams.',
      data: {
        event,
        approvedPlan: event.currentPlan,
        createdTasksCount: createdTasks.length,
        tasks: createdTasks,
      },
    });
  } catch (err) {
    console.error('[Event Controller] approvePlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject Plan (Coordinator only)
// @route   POST /api/events/:id/reject-plan
// @access  Private (Coordinator)
const rejectPlan = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const event = await Event.findById(req.params.id).populate('currentPlan');

    if (!event || !event.currentPlan) {
      return res.status(404).json({ success: false, message: 'Event or current plan not found.' });
    }

    event.currentPlan.status = 'Rejected';
    await event.currentPlan.save();

    event.status = 'Rejected';
    event.rejectionReason = rejectionReason || 'Plan does not meet current administrative guidelines.';
    await event.save();

    await Notification.create({
      recipientTeam: 'Coordinator',
      title: `Plan Rejected: "${event.title}"`,
      message: `Plan rejected with feedback: "${event.rejectionReason}". You may adjust parameters and regenerate.`,
      type: 'general',
      eventId: event._id,
    });

    res.json({
      success: true,
      message: 'Plan has been marked as rejected.',
      data: event,
    });
  } catch (err) {
    console.error('[Event Controller] rejectPlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Edit Plan Data manually
// @route   PUT /api/events/:id/plan
// @access  Private (Coordinator)
const updatePlan = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('currentPlan');
    if (!event || !event.currentPlan) {
      return res.status(404).json({ success: false, message: 'Event or plan not found.' });
    }

    const { schedule, venueAllocation, budgetEstimation, recommendations } = req.body;
    const plan = await EventPlanVersion.findById(event.currentPlan._id);

    if (schedule) plan.planData.schedule = schedule;
    if (venueAllocation) plan.planData.venueAllocation = venueAllocation;
    if (budgetEstimation) plan.planData.budgetEstimation = budgetEstimation;
    if (recommendations) plan.planData.recommendations = recommendations;

    plan.changeSummary = `${plan.changeSummary} | Edited manually by Coordinator`;
    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully.',
      data: plan,
    });
  } catch (err) {
    console.error('[Event Controller] updatePlan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get version history for event
// @route   GET /api/events/:id/versions
// @access  Private
const getEventVersions = async (req, res) => {
  try {
    const versions = await EventPlanVersion.find({ eventId: req.params.id })
      .populate('generatedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ versionNumber: -1 });

    res.json({
      success: true,
      data: versions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  generatePlan,
  replanEvent,
  resolveConflicts,
  approvePlan,
  rejectPlan,
  updatePlan,
  getEventVersions,
};
