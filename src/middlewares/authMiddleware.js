const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {const authHeader = req.header('Authorization');

    // Check if the header exists and follows the 'Bearer <token>' format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No or malformed token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
    console.log("Authorization Token:", token);

    try {
        const decoded = jwt.verify(token, 'your_secret_key'); // Verify the token with your secret key
        console.log("Decoded Token:", decoded);
        req.user = decoded; // Attach decoded user data to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
