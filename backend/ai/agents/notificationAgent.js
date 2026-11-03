class NotificationAgent {
  constructor() {
    this.name = 'Notification Agent';
    this.role = 'Generates synchronized communication alerts, conflict advisories, and task assignments across team channels.';
  }

  async run(context) {
    const { eventData, conflictData, taskData } = context;
    const { title } = eventData;
    const notifications = [];

    // 1. Conflict alerts for Coordinator
    if (conflictData && conflictData.conflicts && conflictData.conflicts.length > 0) {
      const highSeverity = conflictData.conflicts.filter(c => c.severity === 'High');
      if (highSeverity.length > 0) {
        notifications.push({
          recipientTeam: 'Coordinator',
          title: `⚠️ Action Required: ${highSeverity.length} Critical Conflict(s) in "${title}"`,
          message: `The AI Conflict Detection Agent flagged: ${highSeverity.map(c => c.type).join(', ')}. Review recommendations before approving plan.`,
          type: 'conflict',
        });
      } else {
        notifications.push({
          recipientTeam: 'Coordinator',
          title: `Conflict Advisory for "${title}"`,
          message: `${conflictData.conflicts.length} minor operational conflict(s) detected. Mitigations have been drafted in the event plan.`,
          type: 'conflict',
        });
      }
    }

    // 2. Pending Approval notification for Coordinator
    notifications.push({
      recipientTeam: 'Coordinator',
      title: `Plan Ready for Review: "${title}"`,
      message: `Multi-Agent AI synthesis complete. Master schedule, resource calculations, and task distribution await your executive review.`,
      type: 'approval',
    });

    // 3. Team assignment notifications
    const targetTeams = ['Venue Team', 'Technical Team', 'Volunteer Team', 'Security Team'];
    for (const team of targetTeams) {
      notifications.push({
        recipientTeam: team,
        title: `New Event Plan Drafted: "${title}"`,
        message: `Responsibilities and provisional task allocations have been mapped for your team. Detailed execution begins upon Coordinator sign-off.`,
        type: 'task_assignment',
      });
    }

    return {
      status: 'success',
      agent: this.name,
      data: {
        notifications,
      },
    };
  }
}

module.exports = new NotificationAgent();
