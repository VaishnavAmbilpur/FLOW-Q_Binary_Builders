const mongoose = require("mongoose");
const { string } = require("zod");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const patientSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  externalPatientId: { type: String, index: true }, // Optional Zero-PII identifier used by external aggregators
  isAnonymous: { type: Boolean, default: false }, // When true, phone/name are nullified
  name: { type: String }, // Made optional for zero-PII
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  description: { type: String }, // Made optional
  notes: { type: String, default: "" }, // Receptionist clinical note e.g. "chest pain", "BP follow-up"
  tokenNumber: { type: Number, required: true },
  sortOrder: { type: Number }, // Controls queue position; independent from tokenNumber shown to patient
  status: {
    type: String,
    enum: ["waiting", "completed", "cancelled"],
    default: "waiting",
    index: true
  },
  number: { type: String }, // Made optional
  uniqueLinkId: { type: String, required: true, unique: true },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  nextVisitDate: {
    type: Date
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

// Compound index for efficient multi-tenant queue queries
patientSchema.index({ hospitalId: 1, branchId: 1, doctorId: 1, status: 1, tokenNumber: 1 });

// Index for history queries with completedAt
patientSchema.index({ hospitalId: 1, branchId: 1, doctorId: 1, completedAt: -1 });

patientSchema.pre('findOneAndUpdate', async function () {
  // Capture the state before mutation
  const oldDoc = await this.model.findOne(this.getQuery()).lean();
  if (oldDoc) {
    this._oldState = oldDoc;
  }
});

patientSchema.post('findOneAndUpdate', async function (doc) {
  if (this._oldState && doc) {
    const DataChangeLog = require('./DataChangeLog');
    try {
      await DataChangeLog.create({
        organizationId: doc.hospitalId,
        collectionName: "Patient",
        documentId: doc._id,
        action: "UPDATE",
        oldState: this._oldState,
        newState: doc.toObject()
        // changedBy could be injected if we use CLS-Hooked or pass user context in query options
      });
    } catch (err) {
      console.error("Failed to log Patient diff:", err);
    }
  }
});

// Apply encryption to sensitive fields
patientSchema.plugin(mongooseFieldEncryption, {
  fields: ["name", "number", "notes"],
  secret: process.env.FIELD_ENCRYPTION_SECRET || "fallback_secret_must_change_in_prod",
});

module.exports = mongoose.model("Patient", patientSchema);
