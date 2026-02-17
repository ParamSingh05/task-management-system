const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ─── Serve Static Frontend Files ─────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ──────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ─── Health Check ────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API is running',
        timestamp: new Date()
    });
});

// ─── Serve Frontend for All Other Routes ─────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ─────────────────────────────
async function startServer() {
    try {
        console.log('🔄 Initializing database...');
        await initializeDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('========================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log('========================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();