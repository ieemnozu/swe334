const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function authGuard(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = decoded;      // Full user data from JWT
        req.user_id = decoded.id; // User ID for easy access
        
        next();
    });
}

module.exports = authGuard;