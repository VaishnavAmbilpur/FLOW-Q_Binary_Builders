const CommunicationConsent = require('../models/CommunicationConsent');
const logger = require('../utils/logger');

/**
 * Middleware to act as a gatekeeper before dispatching any external messages (e.g., WhatsApp).
 * Intercepts outbound notification controllers to ensure the recipient has actively opted-in.
 */
const communicationGatekeeper = async (req, res, next) => {
    try {
        // Typically, the phone number and hospital ID are in the request body for an outbound message
        const phoneNumber = req.body.phoneNumber || req.body.number;

        // We need organizationId from the authenticated user or the hospital token context
        const hospitalId = (req.user && req.user.hospitalId) || req.body.hospitalId;

        const purpose = req.body.purpose || 'queue_updates';

        if (!phoneNumber || !hospitalId) {
            logger.warn('Gatekeeper bypass attempted: Missing phoneNumber or hospitalId');
            return res.status(400).json({ error: "Missing required fields for communication." });
        }

        // Database lookup for consent
        const consentRecord = await CommunicationConsent.findOne({
            phoneNumber: phoneNumber,
            organizationId: hospitalId,
            purpose: purpose
        });

        if (!consentRecord || !consentRecord.optInStatus) {
            logger.info(`Message dropped by Gatekeeper. No consent for ${phoneNumber}`);
            return res.status(403).json({
                error: "Consent Error",
                message: "This patient has not opted in for notifications or has explicitly opted out."
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
