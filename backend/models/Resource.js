const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'AudioVisual',
        'Furniture',
        'Network',
        'Catering',
        'Safety',
        'Signage',
        'Stage',
      ],
      default: 'AudioVisual',
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      default: 'units',
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['Optimal', 'Fair', 'Needs Maintenance'],
      default: 'Optimal',
    },
    location: {
      type: String,
      default: 'Central Campus Logistics Hub',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
