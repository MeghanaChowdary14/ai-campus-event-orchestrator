const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientTeam: {
      type: String,
      enum: [
        'All',
        'Coordinator',
        'Venue Team',
        'Technical Team',
        'Volunteer Team',
        'Security Team',
      ],
      default: 'All',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'conflict',
        'approval',
        'task_assignment',
        'replanning',
        'status_update',
        'general',
      ],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
