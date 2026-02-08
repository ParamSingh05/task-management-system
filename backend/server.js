// ========================================
// IMPORT PACKAGES
// ========================================
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// ========================================
// INITIALIZE EXPRESS APP
// ========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE
// ========================================

// Trust proxy (important for cookies)
app.set('trust proxy', 1);

// CORS - MUST BE FIRST, BEFORE SESSION
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5501', 'http://127.0.0.1:5501'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['set-cookie']
}));

// Body parser - BEFORE session
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - AFTER CORS
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production-12345',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
        secure: false,           // MUST be false for localhost/HTTP
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',        // Important for cross-origin
        path: '/'
    },
    rolling: true  // Reset expiration on every request
}));

// Debug middleware to check sessions (OPTIONAL - can remove later)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    if (req.session.userId) {
        console.log('✅ Session found - User ID:', req.session.userId);
    }
    next();
});

// ========================================
// ROUTES
// ========================================

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API is running',
        timestamp: new Date()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ========================================
// START SERVER
// ========================================
async function startServer() {
    try {
        // Test database connection
        await testConnection();

        // Start server
        app.listen(PORT, () => {
            console.log('========================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('========================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
// CORS - Updated for production
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            process.env.FRONTEND_URL || 'https://your-app.up.railway.app'
        ];
        
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));