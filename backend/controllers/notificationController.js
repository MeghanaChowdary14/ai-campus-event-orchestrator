const Notification = require('../models/Notification');

// @desc    Get notifications for user and user's role
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    const filter = {
      $or: [
        { recipientUser: req.user._id },
        { recipientTeam: role },
        { recipientTeam: 'All' },
      ],
    };

    const notifications = await Notification.find(filter)
      .populate('eventId', 'title category')
      .populate('taskId', 'title assignedTeam priority')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      read: false,
    });

    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const role = req.user.role;
    await Notification.updateMany(
      {
        $or: [
          { recipientUser: req.user._id },
          { recipientTeam: role },
          { recipientTeam: 'All' },
        ],
        read: false,
      },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
