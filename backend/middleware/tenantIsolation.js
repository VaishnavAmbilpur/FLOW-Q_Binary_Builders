/**
 * Middleware to enforce logical data isolation.
 * Automatically injects the user's hospitalId into a standard req.dbQuery object.
 * Developers must use req.dbQuery instead of {} when querying the database 
 * to ensure they are strictly bounded to the tenant.
 */
const tenantIsolationMiddleware = (req, res, next) => {
    // Start with an empty query object
    req.dbQuery = {};

    // If the user is authenticated and belongs to a hospital
    if (req.user && req.user.hospitalId) {
        // Enforce boundary
        req.dbQuery.hospitalId = req.user.hospitalId;

        // Optionally bind branch routing if applicable (e.g. Receptionist)
        if (req.user.branchId && req.user.role !== 'admin') {
            req.dbQuery.branchId = req.user.branchId;
        }
    }

    next();
};

module.exports = tenantIsolationMiddleware;
