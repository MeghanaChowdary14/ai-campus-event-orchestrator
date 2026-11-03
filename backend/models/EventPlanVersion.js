const mongoose = require('mongoose');

const eventPlanVersionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Draft', 'Under Review', 'Approved', 'Superseded', 'Rejected'],
      default: 'Under Review',
    },
    changeSummary: {
      type: String,
      default: 'Initial AI-orchestrated event plan',
    },
    planData: {
      summary: {
        overview: { type: String, default: '' },
        estimatedTotalCost: { type: Number, default: 0 },
        allocatedBudget: { type: Number, default: 0 },
        feasibilityScore: { type: Number, default: 85 },
        riskLevel: { type: String, default: 'Low' },
      },
      schedule: [
        {
          activity: { type: String, required: true },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
          venue: { type: String, required: true },
          description: { type: String, default: '' },
          leadTeam: { type: String, default: 'Volunteer Team' },
        },
      ],
      venueAllocation: [
        {
          venueName: { type: String, required: true },
          allocatedFor: { type: String, default: 'General' },
          capacity: { type: Number, default: 0 },
          expectedCrowd: { type: Number, default: 0 },
          utilizationPercentage: { type: Number, default: 0 },
          status: { type: String, default: 'Allocated' },
        },
      ],
      resourceRequirements: [
        {
          resourceName: { type: String, required: true },
          category: { type: String, default: 'AudioVisual' },
          quantityRequired: { type: Number, default: 1 },
          quantityAvailable: { type: Number, default: 1 },
          unitCost: { type: Number, default: 0 },
          totalCost: { type: Number, default: 0 },
          shortage: { type: Boolean, default: false },
        },
      ],
      budgetEstimation: {
        venueCost: { type: Number, default: 0 },
        equipmentCost: { type: Number, default: 0 },
        logisticsCost: { type: Number, default: 0 },
        securityCost: { type: Number, default: 0 },
        contingencyCost: { type: Number, default: 0 },
        totalEstimatedCost: { type: Number, default: 0 },
        remainingBudget: { type: Number, default: 0 },
        status: { type: String, default: 'Within Budget' },
      },
      teamAssignments: [
        {
          team: { type: String, required: true },
          responsibilities: [{ type: String }],
          keyMilestones: [{ type: String }],
          assignedStaffCount: { type: Number, default: 5 },
        },
      ],
      conflicts: [
        {
          id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
          type: { type: String, default: 'General' },
          severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
          description: { type: String, required: true },
          suggestedSolution: { type: String, default: '' },
          resolved: { type: Boolean, default: false },
        },
      ],
      recommendations: [{ type: String }],
      agentLogs: [
        {
          agentName: { type: String, required: true },
          status: { type: String, default: 'Success' },
          message: { type: String, default: '' },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EventPlanVersion', eventPlanVersionSchema);
