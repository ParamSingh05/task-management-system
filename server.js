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
    let retries = 5;

    while (retries > 0) {
        try {
            await initializeDatabase();

            app.listen(PORT, () => {
                console.log('========================================');
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📍 URL: http://localhost:${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
                console.log('========================================');
            });
            break;
        } catch (error) {
            retries--;
            console.error(`❌ Startup failed. Retries left: ${retries}`);
            console.error('Error:', error.message);

            if (retries === 0) {
                console.error('❌ Could not start server after multiple attempts');
                process.exit(1);
            }

            console.log('⏳ Waiting 5 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startServer();