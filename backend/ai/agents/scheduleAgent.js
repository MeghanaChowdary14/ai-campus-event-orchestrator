class ScheduleAgent {
  constructor() {
    this.name = 'Schedule Agent';
    this.role = 'Synthesizes conflict-free chronological timetables, buffers transitions, and coordinates lead teams.';
  }

  async run(context) {
    const { eventData, venueData } = context;
    const { startDate, endDate, durationHours, activities = [], title } = eventData;
    const venueName = (venueData && venueData.primaryVenue) || 'Main Campus Auditorium';

    const startObj = new Date(startDate);
    const scheduleItems = [];

    // Helper format time
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    let currentTime = new Date(startObj.getTime());

    // Slot 1: Registration & Delegate Entry
    const regStart = new Date(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + 45 * 60 * 1000);
    scheduleItems.push({
      activity: 'Delegate Check-in & Welcome Kit Distribution',
      startTime: formatTime(regStart),
      endTime: formatTime(currentTime),
      venue: `${venueName} - Entry Foyer`,
      description: 'Registration verification, badge printing, and attendee safety briefing.',
      leadTeam: 'Volunteer Team',
    });

    // Slot 2: Inauguration & Keynote
    const inauStart = new Date(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + 45 * 60 * 1000);
    scheduleItems.push({
      activity: 'Opening Ceremony & Keynote Address',
      startTime: formatTime(inauStart),
      endTime: formatTime(currentTime),
      venue: venueName,
      description: 'Welcome speech by Dean, lamp lighting, and keynote introduction.',
      leadTeam: 'Coordinator',
    });

    // Activities from event input
    if (activities && activities.length > 0) {
      activities.forEach((act, idx) => {
        const actDuration = act.durationMinutes || 60;
        const actStart = new Date(currentTime.getTime());
        currentTime = new Date(currentTime.getTime() + actDuration * 60 * 1000);

        // Assign lead team based on activity nature
        let leadTeam = 'Technical Team';
        if (act.name.toLowerCase().includes('quiz') || act.name.toLowerCase().includes('cultural')) {
          leadTeam = 'Volunteer Team';
        } else if (act.name.toLowerCase().includes('security') || act.name.toLowerCase().includes('crowd')) {
          leadTeam = 'Security Team';
        }

        scheduleItems.push({
          activity: act.name,
          startTime: formatTime(actStart),
          endTime: formatTime(currentTime),
          venue: act.preferredVenue || venueName,
          description: act.description || `Core competitive and interactive session for ${act.name}.`,
          leadTeam,
        });

        // Add 15-minute buffer/break between long sessions
        if (idx < activities.length - 1 && actDuration >= 60) {
          const breakStart = new Date(currentTime.getTime());
          currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
          scheduleItems.push({
            activity: 'Networking Break & Refreshments',
            startTime: formatTime(breakStart),
            endTime: formatTime(currentTime),
            venue: `${venueName} - Hospitality Hall`,
            description: 'Beverages served for students and faculty guests.',
            leadTeam: 'Volunteer Team',
          });
        }
      });
    } else {
      // Default core block if user didn't specify individual activities
      const coreStart = new Date(currentTime.getTime());
      currentTime = new Date(currentTime.getTime() + 90 * 60 * 1000);
      scheduleItems.push({
        activity: `${title} - Main Session & Presentations`,
        startTime: formatTime(coreStart),
        endTime: formatTime(currentTime),
        venue: venueName,
        description: 'Interactive track presentations, demos, and evaluation.',
        leadTeam: 'Technical Team',
      });
    }

    // Slot Final: Valedictory & Wrap-up
    const valStart = new Date(currentTime.getTime());
    currentTime = new Date(currentTime.getTime() + 45 * 60 * 1000);
    scheduleItems.push({
      activity: 'Valedictory Ceremony, Awards & Vote of Thanks',
      startTime: formatTime(valStart),
      endTime: formatTime(currentTime),
      venue: venueName,
      description: 'Prize distribution to winning teams, certificate issuance, and concluding address.',
      leadTeam: 'Coordinator',
    });

    return {
      status: 'success',
      agent: this.name,
      data: {
        schedule: scheduleItems,
      },
    };
  }
}

module.exports = new ScheduleAgent();
