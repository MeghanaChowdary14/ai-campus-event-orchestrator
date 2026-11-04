const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_event_orchestrator_jwt_secret_key_2026_secure',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const validRoles = [
      'Coordinator',
      'Venue Team',
      'Technical Team',
      'Volunteer Team',
      'Security Team',
    ];

    const assignedRole = role && validRoles.includes(role) ? role : 'Coordinator';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: department || 'Campus Operations',
      phone: phone || '',
      isApproved: false, // Requires admin approval
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: false,
      },
      message: 'Registration submitted successfully! Your account is pending administrator verification and approval before you can sign in.',
    });
  } catch (err) {
    console.error('[Auth Controller] Register error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check admin approval
    if (!user.isApproved && user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Your registration is currently pending administrator verification. Please wait for an Admin to review and approve your account.',
        pendingApproval: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isApproved: user.isApproved,
        token,
      },
    });
  } catch (err) {
    console.error('[Auth Controller] Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get team members/users
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Approve or reject a user registration
// @route   PUT /api/auth/users/:id/approve
// @access  Private (Admin only)
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;

    if (req.body.role) {
      user.role = req.body.role;
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} approved successfully as ${user.role}.`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Reject / delete a user registration
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an Admin account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Registration for ${user.name} was rejected and removed.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  approveUser,
  deleteUser,
};
