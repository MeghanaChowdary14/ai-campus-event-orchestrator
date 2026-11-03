const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  generatePlan,
  replanEvent,
  resolveConflicts,
  approvePlan,
  rejectPlan,
  updatePlan,
  getEventVersions,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public to authenticated roles
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.get('/:id/versions', protect, getEventVersions);

// Coordinator privileged routes
router.post('/', protect, authorize('Coordinator'), createEvent);
router.post('/:id/generate-plan', protect, authorize('Coordinator'), generatePlan);
router.post('/:id/replan', protect, authorize('Coordinator'), replanEvent);
router.post('/:id/resolve-conflicts', protect, authorize('Coordinator'), resolveConflicts);
router.post('/:id/approve-plan', protect, authorize('Coordinator'), approvePlan);
router.post('/:id/reject-plan', protect, authorize('Coordinator'), rejectPlan);
router.put('/:id/plan', protect, authorize('Coordinator'), updatePlan);

module.exports = router;
