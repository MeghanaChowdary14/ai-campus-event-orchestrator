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

const PORT = process.env.PORT || 5000;

// Database connection promise (cached for serverless)
let dbReady = null;
const ensureDB = () => {
  if (!dbReady) {
    dbReady = connectDB().then(async () => {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server] Database is empty. Running automatic initial seeder...');
        await seedAll();
      } else {
        console.log(`[Server] Found ${userCount} existing users in database.`);
        // Ensure master admin account exists and is approved
        let adminUser = await User.findOne({ email: 'admin@campus.edu' });
        if (!adminUser) {
          console.log('[Server] Initializing master Administrator account...');
          await User.create({
            name: 'System Administrator',
            email: 'admin@campus.edu',
            password: 'Admin@12345',
            role: 'Admin',
            department: 'Campus Administration',
            phone: '+1 (555) 012-0001',
            isApproved: true,
          });
          console.log('[Server] Master Administrator account created successfully.');
        } else {
          adminUser.isApproved = true;
          adminUser.role = 'Admin';
          await adminUser.save();
        }

        // Also ensure default seeded team roles are approved
        await User.updateMany(
          { email: { $in: ['coordinator@campus.edu', 'venue@campus.edu', 'tech@campus.edu', 'volunteer@campus.edu', 'security@campus.edu'] } },
          { $set: { isApproved: true } }
        );
      }
    }).catch((err) => {
      console.error('[Server] DB connection failed, will retry next request:', err.message);
      dbReady = null; // Reset so next request retries
      throw err;
    });
  }
  return dbReady;
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('[Server] DB connection error:', err);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Re-mount routes AFTER the DB middleware
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use(errorHandler);

// For local development: start server with app.listen
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await ensureDB();
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
}

// For Vercel serverless: export the Express app
module.exports = app;
