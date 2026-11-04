const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  approveUser,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.put('/users/:id/approve', protect, authorize('Admin'), approveUser);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
