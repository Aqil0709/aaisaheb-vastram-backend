const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


// Import route handlers
const authRoutes = require('./api/auth/auth.routes');
const cartRoutes = require('./api/cart/cart.routes');
const profileRoutes = require('./api/profile/profile.routes');
const productRoutes = require('./api/products/products.routes');
const orderRoutes = require('./api/orders/order.router'); // Corrected path
const stockRoutes = require('./api/stock/stock.routes');

const app = express();
// Use the port provided by the deployment environment (like Google App Engine), or 5001 for local development
const PORT = process.env.PORT || 5001;

// --- CORS Configuration for Production ---
// This configuration explicitly allows methods your frontend uses.
const corsOptions = {
<<<<<<< HEAD
  origin: 'https://aaisahebvastram.com', // Your live frontend domain
=======
  origin: 'https://aaisahebvastram.com', // e.g., 'https://yourdomain.com'
>>>>>>> b439795640b7ef5ae2fdfad49619efad9e0baf79
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Ensure this is present for form data

// --- Global Request Logger for Debugging ---
app.use((req, res, next) => {
    console.log(`[SERVER LOG] Request Received: ${req.method} ${req.originalUrl}`);
    next();
});


// --- API ROUTES ---
// Auth routes typically don't need the /artifacts/:appId prefix
app.use('/auth', authRoutes);

// All other routes that are part of the 'artifacts' context need the /api/artifacts/:appId prefix
app.use('/api/artifacts/:appId/cart', cartRoutes);
app.use('/api/artifacts/:appId/profile', profileRoutes);
app.use('/api/artifacts/:appId/products', productRoutes);
app.use('/api/artifacts/:appId/orders', orderRoutes); // Correctly mount order routes
app.use('/api/artifacts/:appId/stock', stockRoutes);

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- Fallback for any unhandled routes (404) ---
app.use((req, res, next) => {
    res.status(404).json({ message: 'API Route not found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
