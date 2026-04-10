const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const communicationConsentSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true }, // Encrypted primary contact
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, required: true },
    optInStatus: { type: Boolean, default: false },
    consentTimestamp: { type: Date, default: Date.now },
    purpose: { type: String, enum: ["queue_updates", "marketing", "appointments"], default: "queue_updates" },
    source: { type: String, enum: ["kiosk", "whatsapp_inbound", "receptionist_ui"], required: true }
});

// Compound index to quickly find if a specific number has consented for an org
communicationConsentSchema.index({ phoneNumber: 1, organizationId: 1, purpose: 1 }, { unique: true });

// Apply field encryption so phone numbers aren't lying around in plaintext
communicationConsentSchema.plugin(mongooseFieldEncryption, {
    fields: ["phoneNumber"],
    secret: process.env.FIELD_ENCRYPTION_SECRET || "fallback_secret_must_change_in_prod",
});

module.exports = mongoose.model("CommunicationConsent", communicationConsentSchema);
