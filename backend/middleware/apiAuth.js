const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const ApiUsage = require('../models/ApiUsage');
const bcrypt = require('bcrypt');

const requireApiKey = async (req, res, next) => {
    try {
        const apiKeyHeader = req.header('x-api-key');

        if (!apiKeyHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Missing x-api-key header'
            });
        }

        // Format: {prefix}_{base64(apiKeyId)}_{secret}
        const parts = apiKeyHeader.split('_');

        if (parts.length < 4) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Malformed API Key'
            });
        }

        const prefix = `${parts[0]}_${parts[1]}`;
        const keyIdBase64 = parts[2];
        const secret = parts[3];

        const keyId = Buffer.from(keyIdBase64, 'base64').toString('utf8');

        const keyRecord = await ApiKey.findOne({ _id: keyId, status: 'Active' })
            .populate('organizationId');

        if (!keyRecord) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid or revoked API Key'
            });
        }

        const organization = keyRecord.organizationId;
        const organizationId = organization?._id;

        if (!organization || organization.status !== 'Active') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Linked Organization is inactive or missing'
            });
        }

        const isMatch = await bcrypt.compare(secret, keyRecord.keyHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid API Key'
            });
        }

        // Update Last Used
        keyRecord.lastUsedAt = new Date();
        await keyRecord.save();

        // Rate Limiting & Usage Tracking Logic
        const planLimits = {
            "Basic": 1000,
            "Pro": 10000,
            "Enterprise": Infinity,
            "Growth": 5000
        };

        const plan = organization.subscriptionPlan || "Basic";
        const maxLimit = planLimits[plan] || 1000;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        try {
            const usageRecord = await ApiUsage.findOneAndUpdate(
                { organizationId: organizationId, yearMonth: currentMonth },
                { $inc: { requestCount: 1 } },
                { returnDocument: 'after', upsert: true }
            );

            if (usageRecord.requestCount > maxLimit) {
                return res.status(429).json({
                    success: false,
                    error: 'Quota Exceeded',
                    message: `Monthly API quota of ${maxLimit} requests for ${plan} plan exceeded.`
                });
            }
        } catch (usageErr) {
            console.error('API Usage Tracking Error:', usageErr);
        }

        // Set request context (Bridging legacy to professional SaaS terms)
        req.organization = organization;
        req.organizationId = organizationId;
        req.hospital = organization; // Legacy compatibility
        req.hospitalId = organizationId; // Legacy compatibility
        req.apiKey = keyRecord;

        next();
    } catch (err) {
        console.error('API Key Auth Error:', err);
        return res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Error verifying API Key',
            detail: err.message
        });
    }
};

module.exports = { requireApiKey };
