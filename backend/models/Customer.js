const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const customerSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  externalCustomerId: { type: String, index: true }, // Optional Zero-PII identifier used by external aggregators
  isAnonymous: { type: Boolean, default: false }, // When true, phone/name are nullified
  name: { type: String }, // Made optional for zero-PII
  clientName: { type: String }, // Compability for v2 API
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  source: {
    type: String,
    enum: ["kiosk", "web", "operator", "api"],
    default: "operator"
  },
  priority: {
    type: String,
    enum: ["NORMAL", "HIGH", "EMERGENCY"],
    default: "NORMAL"
  },
  description: { type: String }, 
  notes: { type: String, default: "" }, // Personnel service note
  tokenNumber: { type: Number, required: true },
  sortOrder: { type: Number }, // Controls queue position
  status: {
    type: String,
    enum: ["waiting", "serving", "completed", "cancelled", "no-show"],
    default: "waiting",
    index: true
  },

  number: { type: String }, // Made optional
  clientPhone: { type: String }, // Compatibility for v2 API
  uniqueLinkId: { type: String, required: true, unique: true },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  nextSessionDate: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

// Compound index for efficient multi-tenant queue queries
customerSchema.index({ organizationId: 1, locationId: 1, agentId: 1, status: 1, tokenNumber: 1 });

// Index for history queries with completedAt
customerSchema.index({ organizationId: 1, locationId: 1, agentId: 1, completedAt: -1 });

customerSchema.pre('findOneAndUpdate', async function () {
  // Capture the state before mutation
  const oldDoc = await this.model.findOne(this.getQuery()).lean();
  if (oldDoc) {
    this._oldState = oldDoc;
  }
});

customerSchema.post('findOneAndUpdate', async function (doc) {
  if (this._oldState && doc) {
    const DataChangeLog = require('./DataChangeLog');
    try {
      await DataChangeLog.create({
        organizationId: doc.organizationId,
        collectionName: "Customer",
        documentId: doc._id,
        action: "UPDATE",
        oldState: this._oldState,
        newState: doc.toObject()
      });
    } catch (err) {
      console.error("Failed to log Customer diff:", err);
    }
  }
});

// Apply encryption to sensitive fields
customerSchema.plugin(mongooseFieldEncryption, {
  fields: ["name", "number", "notes", "clientName", "clientPhone"],
  secret: process.env.FIELD_ENCRYPTION_SECRET || "fallback_secret_must_change_in_prod",
});

module.exports = mongoose.model("Customer", customerSchema);
