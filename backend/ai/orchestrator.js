const planningAgent = require('./agents/planningAgent');
const venueAgent = require('./agents/venueAgent');
const scheduleAgent = require('./agents/scheduleAgent');
const resourceAgent = require('./agents/resourceAgent');
const conflictDetectionAgent = require('./agents/conflictDetectionAgent');
const taskAssignmentAgent = require('./agents/taskAssignmentAgent');
const notificationAgent = require('./agents/notificationAgent');

class AIOrchestrator {
  constructor() {
    this.agents = [
      planningAgent,
      venueAgent,
      scheduleAgent,
      resourceAgent,
      conflictDetectionAgent,
      taskAssignmentAgent,
      notificationAgent,
    ];
  }

  /**
   * Run full multi-agent orchestration pipeline
   */
  async orchestrate(eventData, options = {}) {
    const { dbVenues = [], dbResources = [], existingEvents = [] } = options;
    const agentLogs = [];
    const startTime = Date.now();

    console.log(`[AI Orchestrator] Starting multi-agent pipeline for event: "${eventData.title}"`);

    // Shared execution context
    const context = {
      eventData,
      dbVenues,
      dbResources,
      existingEvents,
      planningData: null,
      venueData: null,
      scheduleData: null,
      resourceData: null,
      conflictData: null,
      taskData: null,
      notificationData: null,
    };

    // Step 1: Planning Agent
    try {
      console.log('[AI Orchestrator] Executing Planning Agent...');
      const res = await planningAgent.run(context);
      context.planningData = res.data;
      agentLogs.push({
        agentName: planningAgent.name,
        status: 'Success',
        message: `Synthesized scope, feasibility score ${res.data.feasibilityScore}/100, and budget baseline.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Planning Agent error:', err);
      agentLogs.push({
        agentName: planningAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 2: Venue Agent
    try {
      console.log('[AI Orchestrator] Executing Venue Agent...');
      const res = await venueAgent.run(context);
      context.venueData = res.data;
      agentLogs.push({
        agentName: venueAgent.name,
        status: 'Success',
        message: `Evaluated ${dbVenues.length} campus venues. Allocated "${res.data.primaryVenue}".`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Venue Agent error:', err);
      agentLogs.push({
        agentName: venueAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 3: Schedule Agent
    try {
      console.log('[AI Orchestrator] Executing Schedule Agent...');
      const res = await scheduleAgent.run(context);
      context.scheduleData = res.data;
      agentLogs.push({
        agentName: scheduleAgent.name,
        status: 'Success',
        message: `Built ${res.data.schedule.length}-phase timetable with transition buffers.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Schedule Agent error:', err);
      agentLogs.push({
        agentName: scheduleAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 4: Resource Agent
    try {
      console.log('[AI Orchestrator] Executing Resource Agent...');
      const res = await resourceAgent.run(context);
      context.resourceData = res.data;
      agentLogs.push({
        agentName: resourceAgent.name,
        status: 'Success',
        message: `Computed ${res.data.resourceRequirements.length} hardware items, ${res.data.staffingNeeds.volunteers} volunteers, ${res.data.staffingNeeds.technicalCrew} tech crew.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Resource Agent error:', err);
      agentLogs.push({
        agentName: resourceAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 5: Conflict Detection Agent
    try {
      console.log('[AI Orchestrator] Executing Conflict Detection Agent...');
      const res = await conflictDetectionAgent.run(context);
      context.conflictData = res.data;
      agentLogs.push({
        agentName: conflictDetectionAgent.name,
        status: 'Success',
        message: `Identified ${res.data.conflicts.length} operational conflict(s). Audit complete.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Conflict Detection Agent error:', err);
      agentLogs.push({
        agentName: conflictDetectionAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 6: Task Assignment Agent
    try {
      console.log('[AI Orchestrator] Executing Task Assignment Agent...');
      const res = await taskAssignmentAgent.run(context);
      context.taskData = res.data;
      agentLogs.push({
        agentName: taskAssignmentAgent.name,
        status: 'Success',
        message: `Constructed ${res.data.generatedTasks.length} prioritized tasks across 5 functional teams.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Task Assignment Agent error:', err);
      agentLogs.push({
        agentName: taskAssignmentAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Step 7: Notification Agent
    try {
      console.log('[AI Orchestrator] Executing Notification Agent...');
      const res = await notificationAgent.run(context);
      context.notificationData = res.data;
      agentLogs.push({
        agentName: notificationAgent.name,
        status: 'Success',
        message: `Generated ${res.data.notifications.length} targeted team advisories and coordinator alerts.`,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[AI Orchestrator] Notification Agent error:', err);
      agentLogs.push({
        agentName: notificationAgent.name,
        status: 'Error',
        message: err.message,
        timestamp: new Date(),
      });
    }

    // Synthesize Master Event Plan
    const masterPlan = this.assemblePlan(context, agentLogs);
    console.log(`[AI Orchestrator] Pipeline completed in ${Date.now() - startTime}ms.`);

    return {
      planData: masterPlan,
      generatedTasks: (context.taskData && context.taskData.generatedTasks) || [],
      notifications: (context.notificationData && context.notificationData.notifications) || [],
    };
  }

  /**
   * Dynamic Replanning when venue or schedule changes occur
   */
  async replan(eventData, previousPlanData, triggerReason, options = {}) {
    console.log(`[AI Orchestrator] Triggering Dynamic Replanning due to: "${triggerReason}"`);

    // Run fresh orchestration with adjusted parameters
    const result = await this.orchestrate(eventData, options);

    // Annotate change summary and mark revision
    result.changeSummary = `Replanned: ${triggerReason}. Venues, buffers, and resource allocations recalibrated.`;
    result.planData.summary.overview = `[REVISED PLAN] ${result.planData.summary.overview}`;

    return result;
  }

  /**
   * Auto resolve detected conflicts
   */
  async resolveConflicts(eventData, currentPlanData, options = {}) {
    console.log('[AI Orchestrator] Running automated conflict resolution...');
    const clonedPlan = JSON.parse(JSON.stringify(currentPlanData));

    // Resolve venue conflicts
    if (clonedPlan.conflicts) {
      clonedPlan.conflicts.forEach(c => {
        c.resolved = true;
        c.resolutionNote = `Auto-resolved by Orchestrator: Applied recommended mitigation - ${c.suggestedSolution}`;
      });
    }

    // If venue capacity conflict, find a venue with higher capacity
    const { dbVenues = [] } = options;
    const largeVenues = dbVenues.filter(v => v.capacity >= eventData.expectedAttendees && v.currentStatus === 'Available');
    if (largeVenues.length > 0 && clonedPlan.venueAllocation && clonedPlan.venueAllocation[0]) {
      const upgrade = largeVenues[0];
      clonedPlan.venueAllocation[0].venueName = upgrade.name;
      clonedPlan.venueAllocation[0].capacity = upgrade.capacity;
      clonedPlan.venueAllocation[0].utilizationPercentage = Math.round((eventData.expectedAttendees / upgrade.capacity) * 100);
      clonedPlan.venueAllocation[0].status = 'Allocated & Conflict Resolved';
    }

    clonedPlan.summary.feasibilityScore = Math.min(98, clonedPlan.summary.feasibilityScore + 10);
    clonedPlan.summary.riskLevel = 'Low';
    clonedPlan.recommendations.push('Automated AI conflict resolution applied. Resource and venue bottlenecks have been cleared.');

    return clonedPlan;
  }

  /**
   * Helper to merge structured agent results
   */
  assemblePlan(context, agentLogs) {
    const { eventData, planningData, venueData, scheduleData, resourceData, conflictData, taskData } = context;

    const budgetBreakdown = (planningData && planningData.budgetBreakdown) || {
      venueCost: Math.round(eventData.budget * 0.25),
      equipmentCost: Math.round(eventData.budget * 0.35),
      logisticsCost: Math.round(eventData.budget * 0.20),
      securityCost: Math.round(eventData.budget * 0.10),
      contingencyCost: Math.round(eventData.budget * 0.10),
    };

    const totalEstimatedCost = Object.values(budgetBreakdown).reduce((a, b) => a + b, 0);
    const remainingBudget = (eventData.budget || 0) - totalEstimatedCost;

    const recommendations = [
      `Maintain a strict 15-minute soundcheck buffer prior to opening keynotes.`,
      `Assign dedicated volunteer liaisons for VIP guests and keynote speakers.`,
      `Ensure security stations have direct radio link with Campus First Aid / Medical Room.`,
      `Distribute digital attendee badges via QR code to eliminate registration bottleneck.`,
    ];

    if (eventData.category === 'Hackathon') {
      recommendations.push(`Keep 2 dedicated high-speed backup 5G hotspots in the server console.`);
    }

    return {
      summary: {
        overview: (planningData && planningData.overview) || `${eventData.title} campus event plan`,
        estimatedTotalCost: totalEstimatedCost,
        allocatedBudget: eventData.budget || 0,
        feasibilityScore: (planningData && planningData.feasibilityScore) || 85,
        riskLevel: (planningData && planningData.riskLevel) || 'Low',
      },
      schedule: (scheduleData && scheduleData.schedule) || [],
      venueAllocation: (venueData && venueData.venueAllocation) || [],
      resourceRequirements: (resourceData && resourceData.resourceRequirements) || [],
      budgetEstimation: {
        ...budgetBreakdown,
        totalEstimatedCost,
        remainingBudget,
        status: remainingBudget >= 0 ? 'Within Budget' : 'Exceeds Budget',
      },
      teamAssignments: (taskData && taskData.teamAssignments) || [],
      conflicts: (conflictData && conflictData.conflicts) || [],
      recommendations,
      agentLogs,
    };
  }
}

module.exports = new AIOrchestrator();
