const express = require('express');
const router = express.Router();
const { getVenues, createVenue, updateVenue } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getVenues);
router.post('/', protect, authorize('Coordinator', 'Venue Team'), createVenue);
router.put('/:id', protect, authorize('Coordinator', 'Venue Team'), updateVenue);

module.exports = router;
