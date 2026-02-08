const { pool } = require('../config/database');

// Middleware to check if user is logged in
const isAuthenticated = async (req, res, next) => {
    // Method 1: Check session
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
        return next();
    }

    // Method 2: Check Authorization header (token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            
            // Verify user exists
            const [users] = await pool.query(
                'SELECT id, name, email FROM users WHERE id = ?',
                [decoded.userId]
            );

            if (users.length > 0) {
                req.userId = users[0].id;
                req.userName = users[0].name;
                req.userEmail = users[0].email;
                return next();
            }
        } catch (error) {
            console.error('Token verification error:', error);
        }
    }

    // Not authenticated
    return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
    });
};

module.exports = { isAuthenticated };