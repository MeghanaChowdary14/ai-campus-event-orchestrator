const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Hackathon',
        'Cultural Fest',
        'Tech Symposium',
        'Sports Meet',
        'Workshop',
        'Seminar',
        'Guest Lecture',
        'Exhibition',
        'Conference',
        'Other',
      ],
      default: 'Tech Symposium',
    },
    expectedAttendees: {
      type: Number,
      required: [true, 'Expected student attendees count is required'],
      min: 1,
    },
    durationHours: {
      type: Number,
      required: [true, 'Event duration in hours is required'],
      default: 4,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date and time is required'],
    },
    budget: {
      type: Number,
      required: [true, 'Allocated budget is required'],
      min: 0,
    },
    numberOfActivities: {
      type: Number,
      default: 1,
    },
    activities: [
      {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        durationMinutes: { type: Number, default: 60 },
        preferredVenue: { type: String, default: '' },
        order: { type: Number, default: 1 },
      },
    ],
    preferredVenues: [
      {
        type: String,
      },
    ],
    specialRequirements: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Planning',
        'Under Review',
        'Approved',
        'Rejected',
        'In Progress',
        'Completed',
        'Replanning Required',
      ],
      default: 'Draft',
    },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventPlanVersion',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
