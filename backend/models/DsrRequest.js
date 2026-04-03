const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const dsrRequestSchema = new mongoose.Schema({
    patientPhone: { type: String, required: true }, // Encrypted
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    requestType: { type: String, enum: ["EXPORT", "DELETE"], required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "COMPLETED", "REJECTED"], default: "PENDING" },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

// Compound index to prevent spamming duplicate requests
dsrRequestSchema.index({ patientPhone: 1, organizationId: 1, requestType: 1, status: 1 });

dsrRequestSchema.plugin(mongooseFieldEncryption, {
    fields: ["patientPhone"],
    secret: process.env.FIELD_ENCRYPTION_SECRET || "fallback_secret_must_change_in_prod",
});

module.exports = mongoose.model("DsrRequest", dsrRequestSchema);
