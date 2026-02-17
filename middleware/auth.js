const isAuthenticated = (req, res, next) => {
    // ─── Method 1: Check Session ─────────────────────
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
        req.userName = req.session.userName;
        req.userEmail = req.session.userEmail;
        return next();
    }

    // ─── Method 2: Check Authorization Header ────────
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        try {
            // Decode base64 token
            const decoded = JSON.parse(
                Buffer.from(token, 'base64').toString('utf8')
            );

            // Check token has required fields
            if (!decoded.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }

            // Check token age (24 hours)
            const tokenAge = Date.now() - decoded.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (tokenAge > maxAge) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            // Set user info on request
            req.userId = decoded.userId;
            req.userName = decoded.userName;
            req.userEmail = decoded.userEmail;

            return next();

        } catch (error) {
            console.error('Token decode error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }
    }

    // ─── Not Authenticated ────────────────────────────
    return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
    });
};

module.exports = { isAuthenticated };