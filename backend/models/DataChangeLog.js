const mongoose = require("mongoose");

const dataChangeLogSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, index: true },
    collectionName: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },
    oldState: { type: mongoose.Schema.Types.Mixed },
    newState: { type: mongoose.Schema.Types.Mixed },
    changedBy: { type: mongoose.Schema.Types.ObjectId }, // User ID if available contextually
    timestamp: { type: Date, default: Date.now, index: true }
}, {
    // Audit collection, ideally immutable or capped.
    capped: false
});

module.exports = mongoose.model("DataChangeLog", dataChangeLogSchema);
