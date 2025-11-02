const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initializeUsers } = require('./controllers/authController');
const { initializeBatches } = require('./controllers/batchController');
const { initializePharmacies } = require('./controllers/pharmacyController');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Medicheck Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Initialize default data
const initializeData = async () => {
  try {
    await initializeUsers();
    await initializeBatches();
    await initializePharmacies();
    console.log('Default data initialized successfully');
  } catch (error) {
    console.log('Error initializing default data:', error.message);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  initializeData();
});