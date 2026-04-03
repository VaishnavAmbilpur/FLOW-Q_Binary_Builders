const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, index: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, index: true },
    role: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "CREATE_APPOINTMENT", "DELETE_QUEUE_ITEM"
    resourceId: { type: String },
    resourceType: { type: String, required: true }, // e.g. "Appointment", "Patient"
    ipAddress: { type: String },
    requestMethod: { type: String },
    requestUrl: { type: String },
    requestBody: { type: mongoose.Schema.Types.Mixed }, // Store the payload
    timestamp: { type: Date, default: Date.now, index: true }
}, {
    // Immutable collection strictly for auditing
    capped: false // Can use capped if specific size is preferred, but standard collection is better for long term
});

// We want to force this schema to be practically immutable from the application layer.
// Hooks can reject any updates or deletes.
auditLogSchema.pre('findOneAndUpdate', function (next) {
    next(new Error('Audit logs are immutable and cannot be updated.'));
});

auditLogSchema.pre('updateOne', function (next) {
    next(new Error('Audit logs are immutable and cannot be updated.'));
});

auditLogSchema.pre('updateMany', function (next) {
    next(new Error('Audit logs are immutable and cannot be updated.'));
});

auditLogSchema.pre('findOneAndDelete', function (next) {
    next(new Error('Audit logs are immutable and cannot be deleted.'));
});

auditLogSchema.pre('deleteOne', function (next) {
    next(new Error('Audit logs are immutable and cannot be deleted.'));
});

auditLogSchema.pre('deleteMany', function (next) {
    next(new Error('Audit logs are immutable and cannot be deleted.'));
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
