class ResourceAgent {
  constructor() {
    this.name = 'Resource Agent';
    this.role = 'Calculates hardware, AV, logistics, volunteer staffing, and security apparatus requirements.';
  }

  async run(context) {
    const { eventData, dbResources = [] } = context;
    const { expectedAttendees, category, specialRequirements = '' } = eventData;

    // Standard baseline resource calculations based on scale
    const attendeeCount = expectedAttendees || 100;

    // Formulas
    const chairsNeeded = Math.ceil(attendeeCount * 1.05); // 5% buffer
    const wirelessMics = attendeeCount > 300 ? 6 : attendeeCount > 100 ? 4 : 2;
    const projectorsNeeded = attendeeCount > 500 ? 3 : 2;
    const wifiAPs = Math.ceil(attendeeCount / 75);
    const walkieTalkies = attendeeCount > 500 ? 12 : attendeeCount > 200 ? 8 : 4;
    const metalDetectors = attendeeCount > 400 ? 4 : 2;
    const podiumCount = 1;
    const stageLightRigs = attendeeCount > 300 ? 4 : 2;

    const baseCalculatedResources = [
      { name: 'HD Laser Projector (4K)', category: 'AudioVisual', required: projectorsNeeded, unitCost: 150 },
      { name: 'Wireless Handheld / Lapel Mics', category: 'AudioVisual', required: wirelessMics, unitCost: 40 },
      { name: 'Stage PA System & Line Array Speakers', category: 'AudioVisual', required: 2, unitCost: 250 },
      { name: 'Stage LED Lighting Rig', category: 'AudioVisual', required: stageLightRigs, unitCost: 120 },
      { name: 'Ergonomic Auditorium Chairs', category: 'Furniture', required: chairsNeeded, unitCost: 3 },
      { name: 'Digital Podium with Teleprompter', category: 'Stage', required: podiumCount, unitCost: 80 },
      { name: 'High-Density Wi-Fi 6 Access Points', category: 'Network', required: wifiAPs, unitCost: 60 },
      { name: 'Security Handheld Metal Detectors', category: 'Safety', required: metalDetectors, unitCost: 35 },
      { name: 'Team Two-Way Walkie Talkies', category: 'Safety', required: walkieTalkies, unitCost: 25 },
      { name: 'Digital Banner & Stage Backdrop', category: 'Signage', required: 2, unitCost: 100 },
    ];

    // If live-streaming requested in special requirements
    if (specialRequirements.toLowerCase().includes('stream') || category === 'Hackathon') {
      baseCalculatedResources.push({
        name: '4K Multi-Camera Live Streaming Rig',
        category: 'AudioVisual',
        required: 1,
        unitCost: 350,
      });
    }

    // Match with dbResources or assign defaults
    const resourceRequirements = [];
    let totalEquipmentCost = 0;

    for (const item of baseCalculatedResources) {
      const match = dbResources.find(r => r.name.toLowerCase() === item.name.toLowerCase());
      const available = match ? match.availableStock : item.required + 5;
      const unitCost = match ? match.unitCost : item.unitCost;
      const totalCost = item.required * unitCost;
      totalEquipmentCost += totalCost;

      const shortage = item.required > available;

      resourceRequirements.push({
        resourceName: item.name,
        category: item.category,
        quantityRequired: item.required,
        quantityAvailable: available,
        unitCost,
        totalCost,
        shortage,
      });
    }

    // Staffing requirements
    const volunteersNeeded = Math.max(5, Math.ceil(attendeeCount / 25));
    const technicalCrewNeeded = Math.max(2, Math.ceil(attendeeCount / 80));
    const securityGuardsNeeded = Math.max(3, Math.ceil(attendeeCount / 50));

    return {
      status: 'success',
      agent: this.name,
      data: {
        resourceRequirements,
        totalEquipmentCost,
        staffingNeeds: {
          volunteers: volunteersNeeded,
          technicalCrew: technicalCrewNeeded,
          securityOfficers: securityGuardsNeeded,
        },
      },
    };
  }
}

module.exports = new ResourceAgent();
