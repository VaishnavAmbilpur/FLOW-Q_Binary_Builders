const IdempotencyKey = require('../models/IdempotencyKey');
const logger = require('../utils/logger');

/**
 * Middleware to enforce Idempotency for mutating API endpoints.
 * Prevents duplicate transactions if 'Idempotency-Key' is provided.
 */
const idempotencyMiddleware = async (req, res, next) => {
    // Only applies to mutations
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return next();
    }

    const key = req.header('Idempotency-Key');
    if (!key) {
        return next();
    }

    const organizationId = req.user ? req.user.organizationId : (req.organizationId || null);
    if (!organizationId) {
        return next(); // Cannot scope idempotency without tenant context
    }

    try {
        const existingRecord = await IdempotencyKey.findOne({ organizationId, key });

        if (existingRecord) {
            logger.info(`Idempotency hit! Returning cached response for key ${key}`);
            if (existingRecord.responseStatus) {
                return res.status(existingRecord.responseStatus).json(existingRecord.responseBody);
            } else {
                return res.status(409).json({ error: "Conflict: Previous request still processing." });
            }
        }

        // Create a lock record signifying "processing"
        const lockRecord = new IdempotencyKey({
            organizationId,
            key,
            requestPath: req.originalUrl,
            requestMethod: req.method,
            // standard 24 hour TTL automatically managed by MongoDB TTL index
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        await lockRecord.save();

        // Intercept the response to save the result
        const originalJson = res.json;
        res.json = function (data) {
            IdempotencyKey.updateOne(
                { _id: lockRecord._id },
                {
                    responseStatus: res.statusCode,
                    responseBody: data
                }
            ).catch(err => logger.error('Failed to update idempotency record:', err));

            return originalJson.call(this, data);
        };

        next();

    } catch (err) {
        if (err.code === 11000) {
            // Race condition: another request just inserted the key
            return res.status(409).json({ error: "Conflict: Concurrent request processing." });
        }
        logger.error('Idempotency middleware error:', err);
        next();
    }
};

module.exports = idempotencyMiddleware;
