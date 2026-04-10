const Customer = require('../models/Customer');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { Types } = require('mongoose');
const { dispatchWebhook } = require('../utils/webhookDispatcher');

exports.createQueueEntry = async (req, res) => {
    try {
        const { agentId, externalCustomerId, name, description, number } = req.body;
        const organizationId = req.organization?._id || req.hospital?._id; // Compatibility

        if (!Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, error: 'Invalid agentId' });
        }

        const agent = await User.findOne({ _id: agentId, organizationId, role: "AGENT" });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found for your API key context' });
        }

        // Get max token number
        const lastCustomer = await Customer.findOne({ agentId }).sort({ tokenNumber: -1 });
        const tokenNumber = lastCustomer ? lastCustomer.tokenNumber + 1 : 1;
        const uniqueLinkId = require('crypto').randomUUID();

        // Resolve location ID
        let locationId = agent?.locationId;
        const organization = req.organization || req.hospital;
        if (!locationId && organization) {
            if (organization.locations && organization.locations.length > 0) {
                locationId = organization.locations[0]._id;
            } else if (organization.branches && organization.branches.length > 0) {
                locationId = organization.branches[0]._id;
            } else {
                // Auto-create default location
                organization.locations = [{ name: "Main Location", address: "Legacy Auto-Created" }];
                await organization.save();
                locationId = organization.locations[0]._id;
            }
        }

        const newCustomer = new Customer({
            organizationId,
            locationId,
            agentId,
            externalCustomerId,
            name,
            description,
            number,
            tokenNumber,
            uniqueLinkId,
            status: "waiting"
        });

        await newCustomer.save();

        const io = global.io;
        if (io) {
            io.to(`agent_${agentId}`).emit("queueUpdated");
            io.to(agentId.toString()).emit("queueUpdated");
            io.to(`organization_${organizationId}`).emit("queueUpdated");
        }

        await dispatchWebhook(organizationId, 'queue.created', {
            id: newCustomer._id,
            externalCustomerId: newCustomer.externalCustomerId,
            agentId: newCustomer.agentId,
            tokenNumber: newCustomer.tokenNumber,
            status: newCustomer.status
        });

        res.status(201).json({
            success: true,
            data: {
                id: newCustomer._id,
                externalCustomerId: newCustomer.externalCustomerId,
                tokenNumber: newCustomer.tokenNumber,
                trackingUrl: `${process.env.FRONTEND_URL}/status/${newCustomer.uniqueLinkId}`
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server error creating queue' });
    }
};

exports.getAgentStatus = async (req, res) => {
    try {
        const { agentId } = req.params;
        const organizationId = req.organization?._id || req.hospital?._id;

        const agent = await User.findOne({ _id: agentId, organizationId, role: "AGENT" })
            .select('availability avgSessionTime expertise');
        if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

        res.status(200).json({
            success: true,
            data: agent
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getQueueStatus = async (req, res) => {
    try {
        const organizationId = req.organization?._id || req.hospital?._id;
        const customer = await Customer.findOne({ uniqueLinkId: req.params.uniqueLinkId, organizationId });
        if (!customer) return res.status(404).json({ success: false, error: 'Queue entry not found' });

        if (customer.status === 'completed' || customer.status === 'cancelled') {
            return res.json({ success: true, data: { status: customer.status } });
        }

        const queue = await Customer.find({ agentId: customer.agentId, status: 'waiting' }).sort({ tokenNumber: 1 });
        const position = queue.findIndex(p => p._id.toString() === customer._id.toString()) + 1;

        res.json({
            success: true,
            data: {
                status: customer.status,
                tokenNumber: customer.tokenNumber,
                position: position > 0 ? position : null,
                estimatedWaitTimeMinutes: position > 0 ? position * (customer.avgSessionTime || 5) : null
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
};

exports.deleteQueueEntry = async (req, res) => {
    try {
        const organizationId = req.organization?._id || req.hospital?._id;
        const customer = await Customer.findOneAndUpdate(
            { uniqueLinkId: req.params.uniqueLinkId, organizationId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!customer) return res.status(404).json({ success: false, error: 'Queue entry not found' });

        const io = global.io;
        if (io) io.to(customer.agentId.toString()).emit("queueUpdated");

        await dispatchWebhook(organizationId, 'queue.cancelled', {
            id: customer._id,
            externalCustomerId: customer.externalCustomerId,
            agentId: customer.agentId,
            tokenNumber: customer.tokenNumber,
            status: customer.status
        });

        res.json({ success: true, message: "Queue entry cancelled" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
};

exports.getAgentQueue = async (req, res) => {
    try {
        const organizationId = req.organization?._id || req.hospital?._id;
        const queue = await Customer.find({ agentId: req.params.agentId, organizationId, status: 'waiting' })
            .sort({ tokenNumber: 1 })
            .select('externalCustomerId tokenNumber status createdAt');

        res.json({ success: true, data: queue });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
};

exports.bookApiAppointment = async (req, res) => {
    try {
        const { agentId, customerName, phone, scheduledAt, notes } = req.body;
        const organizationId = req.organization?._id || req.hospital?._id;

        if (!Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ success: false, error: 'Invalid agentId' });
        }

        const agent = await User.findOne({ _id: agentId, organizationId, role: "AGENT" });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found for your API key context' });
        }

        // Resolve location ID
        let locationId = agent?.locationId;
        const organization = req.organization || req.hospital;
        if (!locationId && organization) {
            if (organization.locations && organization.locations.length > 0) {
                locationId = organization.locations[0]._id;
            } else if (organization.branches && organization.branches.length > 0) {
                locationId = organization.branches[0]._id;
            }
        }

        const appointment = new Appointment({
            organizationId,
            locationId,
            agentId,
            customerName,
            phone,
            scheduledAt,
            notes,
            status: "scheduled"
        });

        await appointment.save();

        res.status(201).json({
            success: true,
            data: {
                id: appointment._id,
                scheduledAt: appointment.scheduledAt,
                status: appointment.status
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server error booking appointment' });
    }
};
