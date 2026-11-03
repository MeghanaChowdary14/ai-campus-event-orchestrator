const Venue = require('../models/Venue');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Private
const getVenues = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.currentStatus = status;
    if (type) filter.type = type;

    const venues = await Venue.find(filter).sort({ capacity: -1 });
    res.json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new venue
// @route   POST /api/venues
// @access  Private (Coordinator, Venue Team)
const createVenue = async (req, res) => {
  try {
    const { name, building, capacity, type, facilities, currentStatus, hourlyRate, contactPerson } = req.body;

    const venue = await Venue.create({
      name,
      building,
      capacity,
      type: type || 'Auditorium',
      facilities: facilities || [],
      currentStatus: currentStatus || 'Available',
      hourlyRate: hourlyRate || 0,
      contactPerson: contactPerson || {},
    });

    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update venue status / details
// @route   PUT /api/venues/:id
// @access  Private (Coordinator, Venue Team)
const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }
    res.json({
      success: true,
      data: venue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getVenues,
  createVenue,
  updateVenue,
};
