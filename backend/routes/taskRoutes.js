const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, authorize('Coordinator'), createTask);
router.put('/:id', protect, updateTaskStatus); // Controller enforces role/team check
router.delete('/:id', protect, authorize('Coordinator'), deleteTask);

module.exports = router;
