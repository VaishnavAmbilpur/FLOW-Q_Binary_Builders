const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function () {
            return this.role === "AGENT" || this.role === "OPERATOR";
        }
    },
    role: {
        type: String,
        enum: ["ORG_ADMIN", "AGENT", "OPERATOR"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password not required for Google OAuth users
        }
    },
    creationPassword: {
        type: String // Stores initial password for Admin recall
    },
    googleId: {
        type: String,
        index: true,
        sparse: true
    },

    // ----------------------------------------
    // AGENT Role Fields
    // ----------------------------------------
    serviceCategory: {
        type: String,
        required: function () {
            return this.role === "AGENT";
        }
    },
    avgSessionTime: {
        type: Number,
        default: 5
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: null
    },
    availability: {
        type: String,
        enum: ["Available", "Not Available"],
        default: "Available"
    },
    pauseMessage: {
        type: String,
        default: ""
    },
    schedule: [{
        day: {
            type: String,
            enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        startTime: String, // HH:MM in 24h format
        endTime: String
    }],
    metrics: {
        totalCustomersServed: { type: Number, default: 0 },
        avgWaitTimeOverall: { type: Number, default: 0 }
    },

    // ----------------------------------------
    // OPERATOR Role Fields
    // ----------------------------------------
    assignedAgents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // ----------------------------------------
    // Authentication & Security
    // ----------------------------------------
    refreshToken: {
        type: String,
        default: null
    },
    refreshTokenExpiry: {
        type: Date,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,

}, { timestamps: true });

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return; // Google OAuth users have no password

    if (!this.password.startsWith("$2b$")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
