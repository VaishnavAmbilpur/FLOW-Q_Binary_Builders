const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if user is logged in
const auth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Check Authorization header as fallback (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log(`[AuthMiddleware] Using token from Authorization header`);
    }

    if (!token) {
      console.log(`[AuthMiddleware] No token found in cookies or header. Available cookies: ${Object.keys(req.cookies || {}).join(', ')}`);
      return res.status(401).json({ message: "Not authenticated" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      organizationId: decoded.organizationId,
      locationId: decoded.locationId
    };

    // For backwards compatibility where endpoints look for req.agentId
    req.agentId = decoded.role === "AGENT" ? decoded.userId : null;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to restrict access to specific roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "User role not identified. Please login again." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

module.exports = {
  auth,
  requireRole
};
