const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Middleware to asynchronously log mutable requests (POST, PUT, PATCH, DELETE) to the AuditLog collection.
 * It will not block the HTTP request overhead but fires a background job to write.
 */
const auditMiddleware = (req, res, next) => {
    // Only care about mutations broadly speaking
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // We defer the logging until the response finishes so we can capture status if desired,
        // or we just fire it off immediately. We'll fire it off to capture the attempt.

        res.on('finish', async () => {
            try {
                // If there's no user, it might be an unauthenticated route, but check anyway
                const userId = req.user ? req.user.id : null;
                const role = req.user ? req.user.role : 'anonymous';
                const hospitalId = req.user ? req.user.hospitalId : null;
                const branchId = req.user ? req.user.branchId : null;

                // Determine action based on Method
                let action = 'UNKNOWN';
                if (req.method === 'POST') action = 'CREATE';
                if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
                if (req.method === 'DELETE') action = 'DELETE';

                // Basic heuristic to get resource type from URL e.g. /api/queue -> queue
                const pathParts = req.baseUrl ? req.baseUrl.split('/') : req.path.split('/');
                const resourceType = pathParts[pathParts.length - 1] || 'Unknown';

                // Attempt to grab resource ID from params or body if evident
                const resourceId = req.params.id || (req.body ? req.body.id : null) || 'N/A';

                const logEntry = new AuditLog({
                    organizationId: hospitalId,
                    locationId: branchId,
                    userId: userId,
                    role: role,
                    action: action,
                    resourceType: resourceType,
                    resourceId: resourceId,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    requestMethod: req.method,
                    requestUrl: req.originalUrl,
                    // careful not to log passwords or highly sensitive PII in req.body
                    // ideally we'd scrub req.body here
                });

                await logEntry.save();
            } catch (err) {
                // Do not crash the app, just log to regular logger
                logger.error('Failed to write to AuditLog:', err);
            }
        });
    }

    next();
};

module.exports = auditMiddleware;
