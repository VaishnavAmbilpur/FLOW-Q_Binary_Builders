/**
 * Middleware to enforce logical data isolation.
 * Automatically injects the user's organizationId into a standard req.dbQuery object.
 * Developers must use req.dbQuery instead of {} when querying the database 
 * to ensure they are strictly bounded to the tenant.
 */
const tenantIsolationMiddleware = (req, res, next) => {
    // Start with an empty query object
    req.dbQuery = {};

    // If the user is authenticated and belongs to an organization
    if (req.user && req.user.organizationId) {
        // Enforce boundary
        req.dbQuery.organizationId = req.user.organizationId;

        // Optionally bind location routing if applicable (e.g. Operator)
        if (req.user.locationId && req.user.role !== 'ORG_ADMIN') {
            req.dbQuery.locationId = req.user.locationId;
        }
    }

    next();
};

module.exports = tenantIsolationMiddleware;
