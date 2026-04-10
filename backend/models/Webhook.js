const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    url: { type: String, required: true },
    secret: { type: String, required: true }, // Used to generate HMAC SHA256 signature
    events: [{
        type: String,
        enum: ["queue.created", "queue.updated", "queue.completed", "queue.cancelled", "agent.status_changed"]
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Webhook", webhookSchema);
