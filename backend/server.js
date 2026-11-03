const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const taskRoutes = require('./routes/taskRoutes');
const venueRoutes = require('./routes/venueRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Auto-seed check
const User = require('./models/User');
const seedAll = require('./seeder/seedData');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI Campus Event Orchestrator API',
    timestamp: new Date(),
    architecture: 'Multi-Agent AI (Planning, Venue, Schedule, Resource, Conflict, Task, Notification)',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running automatic initial seeder...');
      await seedAll();
    } else {
      console.log(`[Server] Found ${userCount} existing users in database.`);
    }

    app.listen(PORT, () => {
      console.log(`\n========================================================`);
      console.log(`🚀 AI Campus Event Orchestrator Backend Running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🤖 Multi-Agent AI Architecture Active`);
      console.log(`========================================================\n`);
    });
  } catch (err) {
    console.error('[Server] Critical startup error:', err);
    process.exit(1);
  }
};

startServer();
