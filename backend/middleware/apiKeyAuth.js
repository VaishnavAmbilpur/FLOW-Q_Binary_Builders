const bcrypt = require('bcryptjs');
const ApiKey = require('../models/ApiKey');
const Hospital = require('../models/Hospital');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate requests coming from external programmatic sources using an API Key.
 * Checks the 'x-api-key' header.
 */
const apiKeyAuthMiddleware = async (req, res, next) => {
    const rawKey = req.header('x-api-key');

    if (!rawKey) {
        return res.status(401).json({ error: "Missing x-api-key header." });
    }

    try {
        // Because keys are hashed, we can't do a direct lookup by raw key string.
        // Usually, API Keys have an ID prefix (e.g. keyId_rawSecret).
        // For standard bcrypt arrays, we must fetch active keys and compare.
        // Assuming the rawKey is sent as "PREFIX_ACTUALSECRET"
        const prefixParts = rawKey.split('_');
        const prefix = prefixParts.length > 1 ? prefixParts[0] + '_' + prefixParts[1] + '_' : null;

        let query = { status: "Active" };
        if (prefix) {
            query.prefix = prefix;
        }

        const potentialKeys = await ApiKey.find(query).populate('hospitalId');
        let validKeyObj = null;

        for (const k of potentialKeys) {
            const isMatch = await bcrypt.compare(rawKey, k.keyHash);
            if (isMatch) {
                validKeyObj = k;
                break;
            }
        }

        if (!validKeyObj) {
            logger.warn('Failed API Key authentication attempt.');
            return res.status(401).json({ error: "Invalid or revoked API Key." });
        }

        // Check if expired
        if (validKeyObj.expiresAt && validKeyObj.expiresAt < new Date()) {
            return res.status(401).json({ error: "API Key has expired." });
        }

        // Update last used timestamp async
        ApiKey.updateOne({ _id: validKeyObj._id }, { lastUsedAt: new Date() }).exec();

        // Inject Identity for downstream middlewares (like tenant isolation)
        req.user = {
            id: validKeyObj._id,
            role: "api_client",
            hospitalId: validKeyObj.hospitalId._id,
        };
        req.hospital = validKeyObj.hospitalId;

        next();
    } catch (err) {
        logger.error('API Key Auth middleware error:', err);
        return res.status(500).json({ error: "Internal server error during authentication." });
    }
};

module.exports = apiKeyAuthMiddleware;
