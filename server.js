const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const connectDB = require("./config/db");

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: `.env.local`, override: true });
}


// Only connect DB when not in test mode (tests can mock or use separate setup)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
app.use(express.json());

// HTTP request logging via morgan, output through Winston
app.use(
  morgan('dev', {
    stream: {
      write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
    },
  })
);

// Configure CORS with options
app.use(cors({
    origin: 'http://localhost:5173', // Allow only specific origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    credentials: true // Allow cookies and authentication headers
  }));

// Routes
app.use('/api/users', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
