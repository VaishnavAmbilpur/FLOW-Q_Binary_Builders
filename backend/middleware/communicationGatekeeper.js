const CommunicationConsent = require('../models/CommunicationConsent');
const logger = require('../utils/logger');

/**
 * Middleware to act as a gatekeeper before dispatching any external messages.
 * Intercepts outbound notification controllers to ensure the recipient has actively opted-in.
 */
const communicationGatekeeper = async (req, res, next) => {
    try {
        const phoneNumber = req.body.phoneNumber || req.body.number;

        // Extract organization context from identity or request body
        const organizationId = (req.user && req.user.organizationId) || req.organizationId || req.body.organizationId || req.body.hospitalId;

        const purpose = req.body.purpose || 'queue_updates';

        if (!phoneNumber || !organizationId) {
            logger.warn('Gatekeeper bypass attempted: Missing phoneNumber or organizationId');
            return res.status(400).json({ error: "Missing required fields for communication." });
        }

        // Database lookup for consent
        const consentRecord = await CommunicationConsent.findOne({
            phoneNumber: phoneNumber,
            organizationId: organizationId,
            purpose: purpose
        });

        if (!consentRecord || !consentRecord.optInStatus) {
            logger.info(`Message dropped by Gatekeeper. No consent for ${phoneNumber}`);
            return res.status(403).json({
                error: "Consent Error",
                message: "This customer has not opted in for notifications or has explicitly opted out."
            });
        }

        // Consent verified, proceed to the actual notification dispatcher
        next();

    } catch (err) {
        logger.error('Communication Gatekeeper error:', err);
        return res.status(500).json({ error: "Internal server error during consent verification." });
    }
};

module.exports = communicationGatekeeper;
