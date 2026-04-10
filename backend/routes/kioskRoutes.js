const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Customer = require("../models/Customer");
const Organization = require("../models/Organization");
const { v4: uuidv4 } = require("uuid");
const { sendQueueConfirmation } = require("../utils/notificationService");
const { emitSocketEvent } = require("../utils/socketUtils");

/**
 * @swagger
 * /kiosk/{organizationId}/agents:
 *   get:
 *     summary: Get available agents for an organization (Kiosk)
 *     tags: [Kiosk]
 */
router.get("/:organizationId/agents", async (req, res) => {
    try {
        const { organizationId } = req.params;
        const agents = await User.find({ organizationId, role: "AGENT", availability: "Available" })
            .select('name expertise avgSessionTime');

        const agentsWithQueues = await Promise.all(agents.map(async (agent) => {
            const queueCount = await Customer.countDocuments({
                agentId: agent._id,
                status: "waiting",
            });
            return {
                _id: agent._id,
                name: agent.name,
                expertise: agent.expertise,
                currentQueueLength: queueCount,
                estimatedWaitMins: queueCount * (agent.avgSessionTime || 5)
            };
        }));

        res.json({ success: true, data: agentsWithQueues });
    } catch (err) {
        console.error("Kiosk Agent fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

/**
 * @swagger
 * /kiosk/{organizationId}/enqueue:
 *   post:
 *     summary: Create a new queue entry (Self check-in)
 *     tags: [Kiosk]
 */
router.post("/:organizationId/enqueue", async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { agentId, name, phone, description } = req.body;

        if (!agentId || !name) {
            return res.status(400).json({ message: "Agent and Name are required" });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const totalCountToday = await Customer.countDocuments({
            agentId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const currentWaitingCount = await Customer.countDocuments({
            agentId,
            status: "waiting"
        });

        const tokenNumber = totalCountToday + 1;
        const sortOrder = currentWaitingCount + 1;
        const uniqueLinkId = uuidv4();
        const agent = await User.findById(agentId);

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Resolve location ID
        let locationId = agent?.locationId;
        if (!locationId) {
            if (organization.locations && organization.locations.length > 0) {
                locationId = organization.locations[0]._id;
            } else {
                return res.status(400).json({ message: "No location found for this organization" });
            }
        }

        const customer = new Customer({
            organizationId,
            locationId,
            agentId,
            name,
            number: phone || "",
            description: description || "Self check-in via Kiosk",
            tokenNumber,
            sortOrder,
            uniqueLinkId,
            status: "waiting",
            createdAt: new Date()
        });

        await customer.save();

        emitSocketEvent(agentId.toString(), "queueUpdated", undefined, organizationId.toString());

        const trackingUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}/status/${uniqueLinkId}`
            : `http://localhost:3000/status/${uniqueLinkId}`;
            
        if (phone) {
            sendQueueConfirmation(phone, name, tokenNumber, trackingUrl, agent?.name || "Staff");
        }

        res.status(201).json({
            success: true,
            message: "Added to queue successfully",
            tokenNumber,
            uniqueLinkId,
            statusLink: `/api/queue/status/${uniqueLinkId}`
        });
    } catch (err) {
        console.error("Kiosk enqueue error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

/**
 * @swagger
 * /kiosk/{organizationId}/display:
 *   get:
 *     summary: Display board for all agents
 *     tags: [Kiosk]
 */
router.get("/:organizationId/display", async (req, res) => {
    try {
        const { organizationId } = req.params;
        const agents = await User.find({ 
            organizationId, 
            role: "AGENT", 
            availability: { $in: ["Available", "Not Available"] } 
        }).select('name expertise');

        const displayData = await Promise.all(agents.map(async (agent) => {
            const upcomingCustomers = await Customer.find({
                agentId: agent._id,
                status: "waiting",
            }).select('tokenNumber name').sort({ tokenNumber: 1 }).limit(4);

            const currentlyServing = upcomingCustomers.length > 0 ? upcomingCustomers[0] : null;
            const nextTokens = upcomingCustomers.slice(1).map(c => c.tokenNumber);

            return {
                agentId: agent._id,
                agentName: agent.name,
                expertise: agent.expertise,
                servingToken: currentlyServing ? currentlyServing.tokenNumber : "---",
                nextTokens: nextTokens
            };
        }));

        res.json({ success: true, data: displayData });
    } catch (err) {
        console.error("Display fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

/**
 * @swagger
 * /kiosk/{organizationId}/display/{agentId}:
 *   get:
 *     summary: Display board for a specific agent
 *     tags: [Kiosk]
 */
router.get("/:organizationId/display/:agentId", async (req, res) => {
    try {
        const { organizationId, agentId } = req.params;
        const agent = await User.findOne({ _id: agentId, organizationId, role: "AGENT" }).select('name expertise');

        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }

        const upcomingCustomers = await Customer.find({
            agentId: agent._id,
            status: "waiting",
        }).select('tokenNumber name').sort({ tokenNumber: 1 }).limit(10);

        const currentlyServing = upcomingCustomers.length > 0 ? upcomingCustomers[0] : null;
        const nextTokens = upcomingCustomers.slice(1).map(c => c.tokenNumber);

        const displayData = {
            agentId: agent._id,
            agentName: agent.name,
            expertise: agent.expertise,
            servingToken: currentlyServing ? currentlyServing.tokenNumber : "---",
            nextTokens: nextTokens
        };

        res.json({ success: true, data: displayData });
    } catch (err) {
        console.error("Agent Specific Display fetch error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
