class TaskAssignmentAgent {
  constructor() {
    this.name = 'Task Assignment Agent';
    this.role = 'Partitions operational deliverables into actionable, prioritized team workflows with target deadlines.';
  }

  async run(context) {
    const { eventData, venueData, scheduleData, resourceData } = context;
    const { startDate, title } = eventData;
    const startObj = new Date(startDate);

    // Helper calculate date offset
    const getDeadline = (daysBefore, hoursBefore = 0) => {
      const d = new Date(startObj.getTime());
      d.setDate(d.getDate() - daysBefore);
      d.setHours(d.getHours() - hoursBefore);
      return d;
    };

    const teamAssignments = [
      {
        team: 'Coordinator',
        responsibilities: [
          'Master event timeline monitoring and stakeholder briefing',
          'Faculty and VIP guest reception coordination',
          'Budget reconciliation and final vendor sanctioning',
        ],
        keyMilestones: ['Approval of Master Plan', 'Final Dress Rehearsal Briefing', 'Closing Debrief'],
        assignedStaffCount: 2,
      },
      {
        team: 'Venue Team',
        responsibilities: [
          'Physical venue inspection, sanitization, and access key handover',
          'Podium, stage risers, and ergonomic seating arrangement',
          'Air conditioning calibration and HVAC testing',
          'Signage and banner mounting at key entrance corridors',
        ],
        keyMilestones: ['Venue Access Cleared', 'Stage & Seating Readiness Complete'],
        assignedStaffCount: 6,
      },
      {
        team: 'Technical Team',
        responsibilities: [
          'Soundboard audio calibration and wireless microphone testing',
          '4K projector alignment and HDMI/wireless display presentation checks',
          'Wi-Fi 6 access point load balancing for student devices',
          'Live video recording and slide deck queue management',
        ],
        keyMilestones: ['AV Dry Run Complete', 'Network Stress Test Passed'],
        assignedStaffCount: (resourceData && resourceData.staffingNeeds && resourceData.staffingNeeds.technicalCrew) || 4,
      },
      {
        team: 'Volunteer Team',
        responsibilities: [
          'Attendee registration desk setup, badge printing, and barcode scanning',
          'Hospitality support and VIP escorting',
          'Distribution of event kits, mementos, and refreshment vouchers',
          'Stage assistance for speaker felicitations and award handouts',
        ],
        keyMilestones: ['Registration Desk Operational', 'Kit Distribution Complete'],
        assignedStaffCount: (resourceData && resourceData.staffingNeeds && resourceData.staffingNeeds.volunteers) || 12,
      },
      {
        team: 'Security Team',
        responsibilities: [
          'Crowd ingress and egress control at primary auditorium checkpoints',
          'Handheld metal detector screening and bag checks',
          'Emergency exit route verification and fire extinguisher clearance',
          'Campus perimeter parking coordination for guest dignitaries',
        ],
        keyMilestones: ['Perimeter Secure', 'Crowd Flow Monitored'],
        assignedStaffCount: (resourceData && resourceData.staffingNeeds && resourceData.staffingNeeds.securityOfficers) || 5,
      },
    ];

    // Individual atomic actionable tasks for database creation upon approval
    const generatedTasks = [
      {
        title: 'Conduct Venue Pre-Event Inspection & Key Handover',
        description: `Inspect venue cleanliness, HVAC air conditioning, and confirm electrical backup supply for ${title}.`,
        assignedTeam: 'Venue Team',
        priority: 'High',
        deadline: getDeadline(2),
      },
      {
        title: 'Complete Audio-Visual & Microphone Dry Run',
        description: `Test all line-array speakers, 4K projector feeds, and wireless mic batteries across primary stage.`,
        assignedTeam: 'Technical Team',
        priority: 'High',
        deadline: getDeadline(1),
      },
      {
        title: 'Deploy Campus Wi-Fi 6 Dedicated SSID for Participants',
        description: `Configure high-capacity wireless bandwidth allocation for expected ${eventData.expectedAttendees} attendees.`,
        assignedTeam: 'Technical Team',
        priority: 'Medium',
        deadline: getDeadline(1, 4),
      },
      {
        title: 'Setup Attendee Check-in Desk & Badge Scanning',
        description: `Organize welcome folders, student lanyards, and configure rapid check-in tablets.`,
        assignedTeam: 'Volunteer Team',
        priority: 'High',
        deadline: getDeadline(0, 2),
      },
      {
        title: 'Coordinate Speaker Green Room & Refreshment Service',
        description: `Manage hospitality catering for invited keynote speakers and judging faculty.`,
        assignedTeam: 'Volunteer Team',
        priority: 'Medium',
        deadline: getDeadline(0, 1),
      },
      {
        title: 'Establish Security Checkpoints & Emergency Exit Clearence',
        description: `Position metal detector screening at entrance portals and verify unblocked emergency evacuation doors.`,
        assignedTeam: 'Security Team',
        priority: 'Critical',
        deadline: getDeadline(0, 3),
      },
      {
        title: 'VIP Dignitary Parking & Campus Perimeter Traffic Protocol',
        description: `Designate reserved parking spaces near entrance corridor for special guests and institute officials.`,
        assignedTeam: 'Security Team',
        priority: 'Medium',
        deadline: getDeadline(0, 2),
      },
      {
        title: 'Lead Pre-Event Alignment & Final Plan Review',
        description: `Gather team leads for final 15-minute briefing and verify emergency escalation contacts.`,
        assignedTeam: 'Coordinator',
        priority: 'High',
        deadline: getDeadline(0, 4),
      },
    ];

    return {
      status: 'success',
      agent: this.name,
      data: {
        teamAssignments,
        generatedTasks,
      },
    };
  }
}

module.exports = new TaskAssignmentAgent();
