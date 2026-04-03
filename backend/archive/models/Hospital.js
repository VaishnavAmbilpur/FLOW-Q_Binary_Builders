const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    branches: [{
        name: { type: String, required: true },
        address: { type: String },
        isActive: { type: Boolean, default: true }
    }],
    subscriptionPlan: {
        type: String,
        enum: ["Basic", "Pro", "Enterprise"],
        default: "Basic"
    },
    piiMode: { type: Boolean, default: false }, // If false, PII is masked out
    dataRetention: {
        queueLogsDays: { type: Number, default: 30 },
        appointmentsDays: { type: Number, default: 90 },
        whatsappLogsDays: { type: Number, default: 15 }
    },
    status: {
        type: String,
        enum: ["Active", "Suspended"],
        default: "Active"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hospital", hospitalSchema);
