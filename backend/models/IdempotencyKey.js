const mongoose = require("mongoose");

const idempotencyKeySchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    key: { type: String, required: true }, // The Idempotency-Key header passed by external API
    requestPath: { type: String, required: true },
    requestMethod: { type: String, required: true },
    responseStatus: { type: Number },
    responseBody: { type: mongoose.Schema.Types.Mixed }, // Stores the JSON response
    expiresAt: { type: Date, expires: 0 } // TTL Index
});

// Compound index to look up idempotency rapidly
idempotencyKeySchema.index({ organizationId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("IdempotencyKey", idempotencyKeySchema);
