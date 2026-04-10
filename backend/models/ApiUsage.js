const mongoose = require("mongoose");

const apiUsageSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    yearMonth: { type: String, required: true, index: true }, // Format: YYYY-MM
    requestCount: { type: Number, default: 0 }
});

// Compound index to ensure one record per tenant per month
apiUsageSchema.index({ organizationId: 1, yearMonth: 1 }, { unique: true });

module.exports = mongoose.model("ApiUsage", apiUsageSchema);
