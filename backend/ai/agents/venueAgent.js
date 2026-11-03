class VenueAgent {
  constructor() {
    this.name = 'Venue Agent';
    this.role = 'Assesses campus venues, verifies physical capacity, checks maintenance status, and guards against double bookings.';
  }

  async run(context) {
    const { eventData, dbVenues = [], existingEvents = [] } = context;
    const { expectedAttendees, preferredVenues = [], startDate, endDate, title } = eventData;

    const eventStart = new Date(startDate).getTime();
    const eventEnd = new Date(endDate).getTime();

    const allocations = [];
    const detectedIssues = [];

    // Filter available venues
    const candidateVenues = dbVenues.length > 0 ? dbVenues : [
      { name: 'Main Campus Auditorium', building: 'Academic Block A', capacity: 1000, currentStatus: 'Available' },
      { name: 'CS Seminar Hall', building: 'Turing IT Wing', capacity: 250, currentStatus: 'Available' },
      { name: 'Open Air Amphitheatre', building: 'Student Activity Hub', capacity: 2000, currentStatus: 'Available' },
      { name: 'Smart Conference Room 101', building: 'Administration Complex', capacity: 60, currentStatus: 'Available' },
      { name: 'Indoor Sports Complex', building: 'Athletics Wing', capacity: 1500, currentStatus: 'Available' },
    ];

    // Check for double bookings with existing events
    const busyVenueNames = new Set();
    for (const ev of existingEvents) {
      if (ev._id && eventData._id && ev._id.toString() === eventData._id.toString()) continue;
      const evStart = new Date(ev.startDate).getTime();
      const evEnd = new Date(ev.endDate).getTime();

      // Overlap condition
      if (Math.max(eventStart, evStart) < Math.min(eventEnd, evEnd)) {
        if (ev.preferredVenues) {
          ev.preferredVenues.forEach(v => busyVenueNames.add(v));
        }
      }
    }

    // Determine target venue
    let primaryVenue = null;

    // Check preferred venue first
    if (preferredVenues.length > 0) {
      for (const pref of preferredVenues) {
        const found = candidateVenues.find(v => v.name.toLowerCase() === pref.toLowerCase());
        if (found) {
          primaryVenue = found;
          break;
        }
      }
    }

    // If no preferred match, pick by capacity fit
    if (!primaryVenue) {
      const sortedByFit = [...candidateVenues]
        .filter(v => v.currentStatus !== 'Maintenance')
        .sort((a, b) => {
          const fitA = a.capacity - expectedAttendees;
          const fitB = b.capacity - expectedAttendees;
          if (fitA >= 0 && fitB < 0) return -1;
          if (fitB >= 0 && fitA < 0) return 1;
          return fitA - fitB;
        });
      primaryVenue = sortedByFit[0] || candidateVenues[0];
    }

    // Check capacity compliance
    const utilizationPercentage = Math.min(100, Math.round((expectedAttendees / (primaryVenue.capacity || 1)) * 100));

    if (primaryVenue.capacity < expectedAttendees) {
      detectedIssues.push({
        type: 'Capacity Overflow',
        severity: 'High',
        description: `Selected venue "${primaryVenue.name}" (Capacity: ${primaryVenue.capacity}) cannot safely accommodate expected crowd of ${expectedAttendees} students.`,
        suggestedSolution: `Upgrade to a larger facility such as the Main Auditorium or Amphitheatre, or partition attendees into multiple phased sessions.`,
      });
    }

    // Check maintenance status
    if (primaryVenue.currentStatus === 'Maintenance') {
      detectedIssues.push({
        type: 'Venue Under Maintenance',
        severity: 'High',
        description: `Venue "${primaryVenue.name}" is flagged under active campus maintenance.`,
        suggestedSolution: `Reroute the event to an alternative available hall of comparable capacity.`,
      });
    }

    // Check double booking
    if (busyVenueNames.has(primaryVenue.name)) {
      detectedIssues.push({
        type: 'Venue Double Booking',
        severity: 'High',
        description: `Venue "${primaryVenue.name}" is already reserved for another sanctioned university event during this exact time window.`,
        suggestedSolution: `Reschedule start/end time or assign an unoccupied alternative venue.`,
      });
    }

    allocations.push({
      venueName: primaryVenue.name,
      allocatedFor: `${title} Main Operations & Sessions`,
      capacity: primaryVenue.capacity,
      expectedCrowd: expectedAttendees,
      utilizationPercentage,
      status: detectedIssues.length === 0 ? 'Allocated & Verified' : 'Conflict Detected',
      building: primaryVenue.building,
    });

    return {
      status: 'success',
      agent: this.name,
      data: {
        venueAllocation: allocations,
        primaryVenue: primaryVenue.name,
        conflicts: detectedIssues,
      },
    };
  }
}

module.exports = new VenueAgent();
