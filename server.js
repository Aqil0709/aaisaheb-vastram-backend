const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import all route handlers
const authRoutes = require('./api/auth/auth.routes');
const cartRoutes = require('./api/cart/cart.routes');
const profileRoutes = require('./api/profile/profile.routes');
const productRoutes = require('./api/products/products.routes');
const orderRoutes = require('./api/orders/order.router');
const stockRoutes = require('./api/stock/stock.routes');

const app = express();
const PORT = process.env.PORT || 5001; // Use Render's port if available

// --- CORS Configuration for Production ---
// This configuration explicitly allows methods your frontend uses.
// IMPORTANT: For production, you should replace '*' with your actual frontend domain.
const corsOptions = {
  origin: 'https://aaisahebvastram.com', // e.g., 'https://yourdomain.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


// --- Core Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Global Request Logger ---
// This is useful for debugging incoming requests on the live server.
app.use((req, res, next) => {
    console.log(`[SERVER LOG] Request Received: ${req.method} ${req.originalUrl}`);
    next();
});

// --- API ROUTES ---
app.use('/auth', authRoutes);
app.use('/api/artifacts/:appId/cart', cartRoutes);
app.use('/api/artifacts/:appId/profile', profileRoutes);
app.use('/api/artifacts/:appId/products', productRoutes);
app.use('/api/artifacts/:appId/orders', orderRoutes);
app.use('/api/artifacts/:appId/stock', stockRoutes);

// --- Static File Serving for Uploaded Images ---
// This makes the 'public' folder accessible to the internet, so images can be viewed.
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- Fallback for any unhandled API routes (404) ---
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
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
