const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    industry: {
        type: String,
        enum: ["healthcare", "banking", "government", "education", "salon", "retail", "other"],
        default: "other"
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    locations: [{
        name: { type: String, required: true },
        address: { type: String },
        isActive: { type: Boolean, default: true }
    }],
    subscriptionPlan: {
        type: String,
        enum: ["Starter", "Growth", "Enterprise"],
        default: "Starter"
    },
    piiMode: { type: Boolean, default: false },
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
    settings: {
        defaultSessionDuration: { type: Number, default: 5 },
        allowWalkIn:            { type: Boolean, default: true },
        allowAppointments:      { type: Boolean, default: true },
        kioskEnabled:           { type: Boolean, default: true }
    }
}, { timestamps: true });

// Auto-generate slug before validation if not provided
organizationSchema.pre("validate", async function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
});

organizationSchema.index({ email: 1 }, { unique: true });
organizationSchema.index({ slug: 1 },  { unique: true });

module.exports = mongoose.model("Organization", organizationSchema);
