const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
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

appointmentSchema.pre('findOneAndUpdate', async function () {
    const oldDoc = await this.model.findOne(this.getQuery()).lean();
    if (oldDoc) {
        this._oldState = oldDoc;
    }
});

appointmentSchema.post('findOneAndUpdate', async function (doc) {
    if (this._oldState && doc) {
        const DataChangeLog = require('./DataChangeLog');
        try {
            await DataChangeLog.create({
                organizationId: doc.organizationId,
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
});

module.exports = mongoose.model('Appointment', appointmentSchema);
