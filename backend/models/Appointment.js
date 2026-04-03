const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    tokenNumber: {
        type: Number
    },
    status: {
        type: String,
        enum: ['scheduled', 'arrived', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String
    }
}, { timestamps: true });

appointmentSchema.pre('findOneAndUpdate', async function (next) {
    const oldDoc = await this.model.findOne(this.getQuery()).lean();
    if (oldDoc) {
        this._oldState = oldDoc;
    }
    next();
});

appointmentSchema.post('findOneAndUpdate', async function (doc, next) {
    if (this._oldState && doc) {
        const DataChangeLog = require('./DataChangeLog');
        try {
            await DataChangeLog.create({
                organizationId: doc.hospitalId,
                collectionName: "Appointment",
                documentId: doc._id,
                action: "UPDATE",
                oldState: this._oldState,
                newState: doc.toObject()
            });
        } catch (err) {
            console.error("Failed to log Appointment diff:", err);
        }
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
