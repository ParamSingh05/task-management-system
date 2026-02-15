// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    // Check session
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
        return next();
    }

    // Check Authorization header (token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            req.userId = decoded.userId;
            req.userName = decoded.userName;
            req.userEmail = decoded.userEmail;
            return next();
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