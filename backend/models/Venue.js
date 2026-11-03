const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      unique: true,
    },
    building: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Venue capacity is required'],
      min: 1,
    },
    type: {
      type: String,
      enum: [
        'Auditorium',
        'Seminar Hall',
        'Open Ground',
        'Lab',
        'Conference Room',
        'Sports Complex',
        'Classroom',
        'Amphitheatre',
      ],
      default: 'Auditorium',
    },
    facilities: [
      {
        type: String,
      },
    ],
    hourlyRate: {
      type: Number,
      default: 0,
    },
    currentStatus: {
      type: String,
      enum: ['Available', 'Maintenance', 'Booked', 'Reserved'],
      default: 'Available',
    },
    contactPerson: {
      name: { type: String, default: 'Facilities Manager' },
      phone: { type: String, default: '555-0199' },
      email: { type: String, default: 'facilities@campus.edu' },
    },
    maintenanceNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venue', venueSchema);
