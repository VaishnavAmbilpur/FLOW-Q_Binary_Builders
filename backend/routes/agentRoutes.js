const router = require("express").Router();
const User    = require("../models/User");
const { auth } = require("../middleware/authMiddleware");
const { emitSocketEvent } = require("../utils/socketUtils");

/**
 * @swagger
 * /agents/info:
 *   get:
 *     summary: Get agent profile
 *     tags: [Agents]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Agent profile returned
 *       401:
 *         description: Unauthorized
 */
router.get("/info", auth, async (req, res) => {
    try {
        const agent = await User.findOne({ _id: req.user.id, role: "AGENT" })
            .select("-password -refreshToken");
            // .populate("serviceId", "name category"); // Service logic is secondary for now
        if (!agent) return res.status(404).json({ message: "Agent not found" });
        res.json(agent);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @swagger
 * /agents/availability:
 *   put:
 *     summary: Update agent availability
 *     tags: [Agents]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - availability
 *             properties:
 *               availability:
 *                 type: string
 *                 enum: [Available, Not Available]
 *                 example: Available
 *               pauseMessage:
 *                 type: string
 *                 description: Message shown when unavailable (e.g. "Back in 20 min")
 *                 example: Back after lunch
 *     responses:
 *       200:
 *         description: Availability updated
 *       401:
 *         description: Unauthorized
 */
router.put("/availability", auth, async (req, res) => {
    try {
        const { availability, pauseMessage } = req.body;

        const update = { availability };
        update.pauseMessage = (availability === "Not Available" && pauseMessage)
            ? pauseMessage.trim().slice(0, 200)
            : "";

        const agent = await User.findOneAndUpdate(
            { _id: req.user.id, role: "AGENT" },
            update,
            { new: true }
        );
        if (!agent) return res.status(404).json({ message: "Agent not found" });

        if (agent.organizationId) {
            // Real-time updates
            const payload = { 
                agentId: agent._id,
                availability: agent.availability, 
                pauseMessage: agent.pauseMessage 
            };
            
            // Standard socket utility
            emitSocketEvent(agent._id.toString(), "agentAvailabilityChanged", payload, agent.organizationId.toString());
            emitSocketEvent(agent._id.toString(), "queueUpdated", undefined, agent.organizationId.toString());
        }

        res.json(agent);
    } catch (err) {
        console.error("Availability Update Error", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @swagger
 * /agents/update-session-duration:
 *   put:
 *     summary: Update average session duration
 *     tags: [Agents]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avgSessionTime
 *             properties:
 *               avgSessionTime:
 *                 type: number
 *                 description: Average session duration in minutes
 *                 example: 10
 *     responses:
 *       200:
 *         description: Session duration updated
 *       400:
 *         description: Invalid value
 */
router.put("/update-session-duration", auth, async (req, res) => {
    try {
        const avgSessionTime = req.body.avgSessionTime || req.body.avgSessionDuration;

        if (!avgSessionTime || avgSessionTime <= 0) {
            return res.status(400).json({ message: "Invalid session duration" });
        }

        const agent = await User.findOneAndUpdate(
            { _id: req.user.id, role: "AGENT" },
            { avgSessionTime },
            { new: true }
        );
        if (!agent) return res.status(404).json({ message: "Agent not found" });

        if (agent.organizationId) {
            emitSocketEvent(agent._id.toString(), "queueUpdated", undefined, agent.organizationId.toString());
        }

        res.json({ message: "Session duration updated", agent });
    } catch (err) {
        console.error("Update session duration error", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Operator Management (Merged from legacy doctorRoutes)
router.put("/operators/assign", auth, async (req, res) => {
    try {
        const { operatorId } = req.body;
        if (req.user.role !== "AGENT") {
            return res.status(403).json({ message: "Only agents can assign operators" });
        }

        const operator = await User.findOne({
            _id: operatorId,
            organizationId: req.user.organizationId,
            role: "OPERATOR"
        });

        if (!operator) {
            return res.status(404).json({ message: "Operator not found in your organization" });
        }

        const agentId = req.user.id.toString();
        if (!operator.assignedAgents.map(id => id.toString()).includes(agentId)) {
            operator.assignedAgents.push(req.user.id);
            await operator.save();
        }

        res.json({
            message: "Operator assigned successfully",
            operator: {
                id: operator._id,
                name: operator.name,
                assignedAgents: operator.assignedAgents
            }
        });
    } catch (err) {
        console.error("Assign Operator Error", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/operators", auth, async (req, res) => {
    try {
        if (req.user.role !== "AGENT") {
            return res.status(403).json({ message: "Agents only" });
        }

        const operators = await User.find({
            organizationId: req.user.organizationId,
            role: "OPERATOR"
        }).select("name email assignedAgents");

        res.json(operators);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
