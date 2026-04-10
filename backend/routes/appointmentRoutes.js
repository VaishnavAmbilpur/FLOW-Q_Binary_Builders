const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const logger = require("../utils/logger");

// Book an appointment
router.post("/book", auth, async (req, res) => {
    try {
        const { agentId, customerName, phone, customerPhone, scheduledAt, notes } = req.body;
        const organizationId = req.user.organizationId;
        const locationId = req.user.locationId;

        const agentQuery = { _id: agentId, organizationId, role: "AGENT" };
        if (locationId) agentQuery.locationId = locationId;

        const agent = await User.findOne(agentQuery);
        if (!agent) return res.status(404).json({ message: "Agent not found" });

        const appointment = new Appointment({
            organizationId,
            locationId: locationId || agent.locationId,
            agentId,
            customerName,
            phone: phone || customerPhone,
            scheduledAt,
            notes,
            status: "scheduled"
        });

        await appointment.save();
        res.status(201).json({ message: "Appointment booked successfully", appointment });
    } catch (err) {
        logger.error("Book Appointment Error", { error: err.message });
        res.status(500).json({ message: "Server error" });
    }
});

// Get today's appointments for an agent
router.get("/agent/:agentId/today", auth, async (req, res) => {
    try {
        const { agentId } = req.params;
        const organizationId = req.user.organizationId;
        const locationId = req.user.locationId;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const apptQuery = {
            agentId,
            organizationId,
            scheduledAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["scheduled", "arrived"] }
        };
        if (locationId) apptQuery.locationId = locationId;

        const appointments = await Appointment.find(apptQuery).sort({ scheduledAt: 1 });

        res.json(appointments);
    } catch (err) {
        logger.error("Get Appointments Error", { error: err.message });
        res.status(500).json({ message: "Server error" });
    }
});

// Get upcoming appointments for an agent (next 7 days)
router.get("/agent/:agentId/upcoming", auth, async (req, res) => {
    try {
        const { agentId } = req.params;
        const organizationId = req.user.organizationId;
        const locationId = req.user.locationId;

        const startOfRange = new Date();
        // startOfRange.setHours(0, 0, 0, 0); // Keep it from now onwards

        const endOfRange = new Date();
        endOfRange.setDate(endOfRange.getDate() + 7);
        endOfRange.setHours(23, 59, 59, 999);

        const query = {
            agentId,
            organizationId,
            scheduledAt: { $gte: startOfRange, $lte: endOfRange },
            status: { $in: ["scheduled", "arrived"] }
        };

        // If user has a specific locationId, restrict to it. 
        // ORG_ADMINs usually don't have a locationId and see org-wide.
        if (locationId) {
            query.locationId = locationId;
        }

        const appointments = await Appointment.find(query).sort({ scheduledAt: 1 });

        res.json(appointments);
    } catch (err) {
        logger.error("Get Upcoming Appointments Error", { error: err.message });
        res.status(500).json({ message: "Server error" });
    }
});

// Mark appointment as arrived
router.put("/:id/arrive", auth, async (req, res) => {
    try {
        const query = { _id: req.params.id, organizationId: req.user.organizationId };
        if (req.user.locationId) {
            query.locationId = req.user.locationId;
        }

        const appointment = await Appointment.findOneAndUpdate(
            query,
            { status: "arrived" },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.json({ message: "Customer arrived", appointment });
    } catch (err) {
        logger.error("Appointment Arrival Error", { error: err.message });
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
