const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_campus_events';

  try {
    // Attempt standard connection first with 20s timeout (Vercel serverless needs more time)
    console.log(`[Database] Connecting to MongoDB... URI starts with: ${uri.substring(0, 30)}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}).`);

    // In production, never fall back to in-memory — throw error instead
    if (process.env.NODE_ENV === 'production') {
      console.error('[Database] Production requires a valid MONGO_URI.');
      throw new Error('Production MongoDB connection failed: ' + err.message);
    }

    console.log('[Database] Falling back to Embedded MongoMemoryServer (dev only)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Embedded In-Memory MongoDB connected: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to start MongoMemoryServer:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
