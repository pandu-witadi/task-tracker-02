// 
// 
const app = require('./app');
const { connectDB } = require('./config/database');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server
const start = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start the server
    await app.listen({ port: PORT, host: HOST });
    
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`API documentation available at http://${HOST}:${PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  app.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  app.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Start the application
start();
