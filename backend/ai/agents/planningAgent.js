const openai = require('../openaiClient');

class PlanningAgent {
  constructor() {
    this.name = 'Planning Agent';
    this.role = 'Analyzes event requirements, establishes event scope, feasibility, and baseline budget allocations.';
  }

  async run(context) {
    const { eventData } = context;
    const {
      title,
      category,
      expectedAttendees,
      durationHours,
      budget,
      activities,
      specialRequirements,
    } = eventData;

    // Try OpenAI if configured
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are the Planning Agent for a University Event Orchestration system.
Analyze the following event parameters and produce a structured JSON plan overview.
Event Title: ${title}
Category: ${category}
Expected Attendees: ${expectedAttendees} students
Duration: ${durationHours} hours
Allocated Budget: $${budget}
Activities: ${JSON.stringify(activities)}
Special Requirements: ${specialRequirements || 'None'}

Return ONLY a JSON object with this exact shape:
{
  "overview": "2-3 concise sentences summarizing event vision and operational scope",
  "feasibilityScore": number between 70 and 99,
  "riskLevel": "Low" | "Medium" | "High",
  "budgetBreakdown": {
    "venueCost": number,
    "equipmentCost": number,
    "logisticsCost": number,
    "securityCost": number,
    "contingencyCost": number
  },
  "phases": ["Pre-Event Setup", "Main Execution", "Post-Event Teardown"]
}`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        });

        const parsed = JSON.parse(response.choices[0].message.content);
        return {
          status: 'success',
          agent: this.name,
          data: {
            overview: parsed.overview,
            feasibilityScore: parsed.feasibilityScore || 88,
            riskLevel: parsed.riskLevel || 'Low',
            budgetBreakdown: parsed.budgetBreakdown,
            phases: parsed.phases,
          },
        };
      } catch (err) {
        console.warn(`[${this.name}] OpenAI failed, using Heuristic Engine:`, err.message);
      }
    }

    // High-Fidelity Heuristic Rule Engine
    const perCapitaBudget = budget / (expectedAttendees || 1);
    let riskLevel = 'Low';
    let feasibilityScore = 92;

    if (perCapitaBudget < 15) {
      riskLevel = 'High';
      feasibilityScore = 68;
    } else if (perCapitaBudget < 35) {
      riskLevel = 'Medium';
      feasibilityScore = 80;
    }

    // Balanced budget formula
    const venueCost = Math.round(budget * 0.28);
    const equipmentCost = Math.round(budget * 0.32);
    const logisticsCost = Math.round(budget * 0.20);
    const securityCost = Math.round(budget * 0.12);
    const contingencyCost = budget - (venueCost + equipmentCost + logisticsCost + securityCost);

    const overview = `${title} is structured as a premier campus ${category.toLowerCase()} designed for ${expectedAttendees} participants over a duration of ${durationHours} hour(s). The multi-agent orchestrator has partitioned operational workflows across 4 campus departments with priority resource allocations for ${activities.length} core activities.`;

    return {
      status: 'success',
      agent: this.name,
      data: {
        overview,
        feasibilityScore,
        riskLevel,
        budgetBreakdown: {
          venueCost,
          equipmentCost,
          logisticsCost,
          securityCost,
          contingencyCost,
        },
        phases: [
          'Phase 1: Pre-Event Logistics & Technical Verification (D-3 to D-1)',
          'Phase 2: Event Day Operational Flow & Stage Management (Day 0)',
          'Phase 3: Post-Event Breakdown, Asset Restocking & Debrief (Day +1)',
        ],
      },
    };
  }
}

module.exports = new PlanningAgent();
