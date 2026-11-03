class ConflictDetectionAgent {
  constructor() {
    this.name = 'Conflict Detection Agent';
    this.role = 'Performs cross-dimensional conflict audits on venues, schedules, hardware resources, and fiscal budgets.';
  }

  async run(context) {
    const { eventData, planningData, venueData, scheduleData, resourceData } = context;
    const conflicts = [];

    // 1. Audit Venue Conflicts (from Venue Agent)
    if (venueData && venueData.conflicts && venueData.conflicts.length > 0) {
      venueData.conflicts.forEach(c => {
        conflicts.push({
          id: `CONF-VEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          type: 'Venue',
          severity: c.severity || 'High',
          description: c.description,
          suggestedSolution: c.suggestedSolution,
          resolved: false,
        });
      });
    }

    // 2. Audit Resource Shortages (from Resource Agent)
    if (resourceData && resourceData.resourceRequirements) {
      resourceData.resourceRequirements.forEach(r => {
        if (r.shortage) {
          const deficit = r.quantityRequired - r.quantityAvailable;
          conflicts.push({
            id: `CONF-RES-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            type: 'Resource',
            severity: deficit > 5 ? 'High' : 'Medium',
            description: `Inventory deficit detected for "${r.resourceName}". Required: ${r.quantityRequired}, In Stock: ${r.quantityAvailable} (Deficit: ${deficit}).`,
            suggestedSolution: `Submit inter-department procurement request to Central Campus Logistics or rent supplementary units from approved university vendor.`,
            resolved: false,
          });
        }
      });
    }

    // 3. Audit Budget Feasibility
    const allocatedBudget = eventData.budget || 0;
    const totalEquipmentCost = (resourceData && resourceData.totalEquipmentCost) || 0;
    const estimatedTotal = (planningData && planningData.budgetBreakdown)
      ? Object.values(planningData.budgetBreakdown).reduce((a, b) => a + b, 0)
      : totalEquipmentCost;

    if (estimatedTotal > allocatedBudget) {
      const overage = estimatedTotal - allocatedBudget;
      conflicts.push({
        id: `CONF-BUD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        type: 'Budget',
        severity: 'High',
        description: `Projected expenditure ($${estimatedTotal}) exceeds current allocated event budget ($${allocatedBudget}) by $${overage}.`,
        suggestedSolution: `Trim discretionary logistics costs, seek sponsorship grants, or request a secondary budget supplement from the Dean of Student Affairs.`,
        resolved: false,
      });
    }

    // 4. Audit Schedule Buffers
    if (scheduleData && scheduleData.schedule) {
      // Check if registration slot is under 30 mins for crowd > 300
      if (eventData.expectedAttendees > 300) {
        const regSlot = scheduleData.schedule.find(s => s.activity.toLowerCase().includes('registration') || s.activity.toLowerCase().includes('check-in'));
        if (regSlot && scheduleData.schedule.length > 1) {
          // Check for tight buffer
          conflicts.push({
            id: `CONF-SCH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            type: 'Schedule',
            severity: 'Low',
            description: `Crowd flow notice: ${eventData.expectedAttendees} attendees with single check-in desk may experience entry congestion.`,
            suggestedSolution: `Deploy 2 additional fast-track check-in QR counters managed by the Volunteer Team.`,
            resolved: false,
          });
        }
      }
    }

    return {
      status: 'success',
      agent: this.name,
      data: {
        conflicts,
        hasCriticalConflicts: conflicts.some(c => c.severity === 'High'),
      },
    };
  }
}

module.exports = new ConflictDetectionAgent();
