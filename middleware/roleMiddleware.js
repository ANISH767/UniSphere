// Middleware to check if user has the required role
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user comes from your existing JWT authMiddleware
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to access this resource.'
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };