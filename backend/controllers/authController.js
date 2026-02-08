const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

// ========================================
// REGISTER NEW USER
// ========================================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email already exists
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// ========================================
// LOGIN USER (NOW WITH TOKEN)
// ========================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const [users] = await pool.query(
            'SELECT id, name, email, password FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create simple token (user ID encoded)
        const token = Buffer.from(JSON.stringify({
            userId: user.id,
            email: user.email,
            timestamp: Date.now()
        })).toString('base64');

        // Also store in session as backup
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        console.log('✅ User logged in:', user.email);

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// ========================================
// LOGOUT USER
// ========================================
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
};

// ========================================
// GET CURRENT USER (UPDATED FOR TOKEN)
// ========================================
const getCurrentUser = (req, res) => {
    // Check session first
    if (req.session.userId) {
        return res.json({
            success: true,
            user: {
                id: req.session.userId,
                name: req.session.userName,
                email: req.session.userEmail
            }
        });
    }

    // Check token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            return res.json({
                success: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email
                }
            });
        } catch (error) {
            console.error('Token decode error:', error);
        }
    }

    res.status(401).json({
        success: false,
        message: 'Not logged in'
    });
};

module.exports = { register, login, logout, getCurrentUser };