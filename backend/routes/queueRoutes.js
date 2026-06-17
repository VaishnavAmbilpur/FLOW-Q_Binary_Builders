const router = require("express").Router();
const Customer = require("../models/Customer");
const { auth } = require("../middleware/authMiddleware");
const { calculateWaitTimes } = require("../utils/waitTimeCalculator");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { addCustomerSchema } = require("../validators/cust_validator");
const logger = require("../utils/logger");
const { sendQueueConfirmation, sendNearlyUpAlert } = require("../utils/notificationService");
const { emitSocketEvent } = require("../utils/socketUtils");

/**
 * @swagger
 * /queue/add:
 *   post:
 *     summary: Add a new customer to the queue
 *     tags: [Queue Management]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - number
 *               - agentId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               number:
 *                 type: string
 *                 example: 9876543210
 *               agentId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Customer added to queue successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/add", auth, async (req, res) => {
  let agentId;
  try {
    const validatedData = addCustomerSchema.parse(req.body);
    const { name, description, number, notes, agentId: bodyAgentId } = validatedData;

    agentId = req.user?.id;

    if (req.user?.role === "OPERATOR") {
      agentId = bodyAgentId;
      if (!agentId) return res.status(400).json({ message: "Agent ID is required for operators" });

      const userOp = await User.findById(req.user.id);
      if (!userOp) {
        return res.status(404).json({ message: "Operator user not found" });
      }

      if (!userOp.assignedAgents || userOp.assignedAgents.length === 0) {
        return res.status(403).json({ message: "No agents assigned to this operator" });
      }

      const assignedAgentIds = userOp.assignedAgents.map(id => id.toString());
      if (!assignedAgentIds.includes(agentId.toString())) {
        return res.status(403).json({ message: "Not authorized for this agent's queue" });
      }
    } else if (req.user?.role !== "AGENT" && !req.agentId) {
      return res.status(403).json({ message: "Only Agents or Operators can add customers" });
    } else if (req.agentId) {
      agentId = req.agentId;
    }

    const agent = await User.findOne({ _id: agentId, role: "AGENT" });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.organizationId) {
      return res.status(500).json({ message: "Agent is not associated with an organization" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalCountToday = await Customer.countDocuments({
      agentId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const waitingCount = await Customer.countDocuments({
      agentId,
      status: "waiting"
    });

    const customer = await Customer.create({
      organizationId: agent.organizationId,
      locationId: req.user.locationId || agent.locationId || agent.organizationId,
      agentId,
      name,
      description,
      notes: notes || "",
      number,
      tokenNumber: totalCountToday + 1,
      sortOrder: waitingCount + 1,
      uniqueLinkId: uuidv4()
    });

    if (customer.decryptFieldsSync) {
      customer.decryptFieldsSync();
    }


    emitSocketEvent(agentId.toString(), "queueUpdated", undefined, agent.organizationId.toString());

    const trackingUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/status/${customer.uniqueLinkId}`
      : `http://localhost:3000/status/${customer.uniqueLinkId}`;
    sendQueueConfirmation(number, name, customer.tokenNumber, trackingUrl, agent.name);

    notifyNextInLine(agentId, agent.organizationId);

    res.json({
      message: "Person Enrolled Successfully",
      customer,
      statusLink: `/api/queue/status/${customer.uniqueLinkId}`
    });
  } catch (err) {
    console.error("Add Customer Error Details:", err);
    if (err.name === "ZodError" || err.issues) {
      return res.status(400).json({
        message: "Validation failed",
        errors: (err.issues || err.errors || []).map(e => ({
          field: e.path?.join('.') || 'unknown',
          message: e.message
        }))
      });
    }
    logger.error("Add Customer Error", {
      error: err?.message || String(err),
      userId: req.user?.id,
      agentId: agentId,
      requestBody: req.body
    });
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/history/", auth, async (req, res) => {
  try {
    const { date, status, search, agentId: queryAgentId } = req.query;
    let targetAgentId;

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role === "AGENT") {
      targetAgentId = req.user.id;
    } else if (req.user?.role === "OPERATOR") {
      const operator = await User.findById(req.user.id);
      if (!operator) {
        return res.status(404).json({ message: "Operator not found" });
      }

      if (!operator.assignedAgents || operator.assignedAgents.length === 0) {
        return res.json([]);
      }

      if (queryAgentId) {
        const assignedAgentIds = operator.assignedAgents.map(id => id.toString());
        if (!assignedAgentIds.includes(queryAgentId.toString())) {
          return res.status(403).json({ message: "Not authorized for this agent's history" });
        }
        targetAgentId = queryAgentId;
      } else {
        targetAgentId = { $in: operator.assignedAgents };
      }
    } else if (req.user?.role === "ORG_ADMIN") {
      if (queryAgentId) {
        const agent = await User.findOne({ _id: queryAgentId, organizationId: req.user.organizationId, role: "AGENT" });
        if (!agent) {
          return res.status(403).json({ message: "Agent not found in your organization" });
        }
        targetAgentId = queryAgentId;
      } else {
        const agents = await User.find({ organizationId: req.user.organizationId, role: "AGENT" }).select('_id');
        if (agents.length === 0) {
          return res.json([]);
        }
        targetAgentId = { $in: agents.map(d => d._id) };
      }
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    let filter = {
      organizationId: req.user.organizationId,
      agentId: targetAgentId,
      status: { $in: ["completed", "cancelled"] }
    };
    if (status) filter.status = status;
    if (date && !isNaN(new Date(date))) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.completedAt = { $gte: start, $lte: end };
    }

    const history = await Customer.find(filter).sort({ completedAt: -1 }).populate('agentId', 'name serviceCategory');

    let decryptedHistory = history.map(p => {
      if (p.decryptFieldsSync) p.decryptFieldsSync();
      return p;
    });

    if (search) {
      const searchLower = search.toLowerCase();
      decryptedHistory = decryptedHistory.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.number && p.number.toLowerCase().includes(searchLower))
      );
    }

    res.json(decryptedHistory);
  } catch (err) {
    logger.error("History Fetch Error", { error: err.message, userId: req.user?.id });
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @swagger
 * /queue/{agentId}:
 *   get:
 *     summary: Get waiting queue for a specific agent
 *     tags: [Queue Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Queue retrieved successfully
 */
router.get("/:agentId", auth, async (req, res) => {
  try {
    const { agentId } = req.params;

    if (req.user.role === "OPERATOR") {
      const operator = await User.findById(req.user.id);
      if (!operator || !operator.assignedAgents || !operator.assignedAgents.map(id => id.toString()).includes(agentId)) {
        return res.status(403).json({ message: "Access denied. You are not assigned to this agent." });
      }
    } else if (req.user.role === "AGENT" && req.user.id !== agentId) {
      return res.status(403).json({ message: "Access denied. You can only view your own queue." });
    }

    const agent = await User.findOne({ _id: agentId, role: "AGENT" });
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const queue = await Customer.find({
      organizationId: agent.organizationId,
      agentId: agentId,
      status: { $in: ["waiting"] }
    }).sort({ sortOrder: 1, tokenNumber: 1 }).populate('agentId', 'name serviceCategory');

    const decryptedQueue = queue.map(p => {
      if (p.decryptFieldsSync) p.decryptFieldsSync();
      return p;
    });

    const queueWithWaitTimes = calculateWaitTimes(decryptedQueue, agent);

    res.json(queueWithWaitTimes);
  } catch (err) {
    logger.error("Fetch Queue Error", { error: err.message });
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

/**
 * @swagger
 * /queue/status/{uniqueLinkId}:
 *   get:
 *     summary: Get customer status by unique link
 *     tags: [Queue Management]
 *     parameters:
 *       - in: path
 *         name: uniqueLinkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 */
router.get("/status/:uniqueLinkId", async (req, res) => {
  try {
    const customer = await Customer.findOne({ uniqueLinkId: req.params.uniqueLinkId })
      .populate("organizationId", "name");

    if (!customer) {
      return res.status(404).json({ message: "Invalid link" });
    }
    if (customer.status === "completed") {
      return res.json({
        status: "completed",
        message: "Thank you for visiting",
        feedback: customer.feedback
      });
    }
    if (customer.status === "cancelled") {
      return res.json({
        status: "cancelled",
        message: "Your appointment has been cancelled."
      });
    }
    const queue = await Customer.find({
      agentId: customer.agentId,
      status: { $in: ["waiting"] }
    }).sort({ sortOrder: 1, tokenNumber: 1 });
    const queueWithMarker = queue.map((p, index) => ({
      id: p._id,
      name: p.name,
      tokenNumber: p.tokenNumber,
      status: p.status,
      isMe: p.uniqueLinkId === customer.uniqueLinkId,
      position: index + 1
    }));

    const myPosition = queueWithMarker.find(q => q.isMe)?.position || null;
    const agent = await User.findById(customer.agentId);

    res.json({
      organizationId: customer.organizationId?._id || customer.organizationId,
      organizationName: customer.organizationId?.name || "Organization",
      agentId: customer.agentId,
      agentName: agent.name,
      agentAvailability: agent.availability,
      agentPauseMessage: agent.pauseMessage || "",
      myStatus: customer.status,
      myTokenNumber: customer.tokenNumber,
      avgTime: agent.avgSessionTime || 5,
      myPosition,
      queue: queueWithMarker
    });

  } catch (err) {
    logger.error("Status Error", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/feedback/:uniqueLinkId", async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const customer = await Customer.findOneAndUpdate(
      { uniqueLinkId: req.params.uniqueLinkId, status: "completed" },
      { feedback: { rating, comment } },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Invalid link or visit not completed yet" });
    }

    res.json({ message: "Feedback submitted successfully", feedback: customer.feedback });
  } catch (err) {
    logger.error("Feedback Error", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/complete/:id", auth, async (req, res) => {
  try {
    const { nextSessionDate } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { 
        status: "completed", 
        completedAt: new Date(),
        nextSessionDate: nextSessionDate || null
      },
      { new: true }
    );

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    emitSocketEvent(customer.agentId.toString(), "queueUpdated", undefined, req.user.organizationId.toString());
    emitSocketEvent(customer.uniqueLinkId, "visitCompleted", { message: "Thank you for visiting" });

    notifyNextInLine(customer.agentId, customer.organizationId);

    res.json(customer);

  } catch (err) {
    logger.error("Complete Customer Error", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/cancel/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user.organizationId },
      { status: "cancelled" },
      { new: true }
    );

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    emitSocketEvent(customer.agentId.toString(), "queueUpdated", undefined, req.user.organizationId.toString());
    emitSocketEvent(customer.uniqueLinkId, "visitCancelled", { message: "Your appointment has been cancelled." });

    notifyNextInLine(customer.agentId, customer.organizationId);

    res.json(customer);

  } catch (err) {
    logger.error("Cancel Error", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/reorder/:agentId", auth, async (req, res) => {
  try {
    const { newOrder } = req.body;

    let queue = await Customer.find({
      organizationId: req.user.organizationId,
      agentId: req.params.agentId,
      status: "waiting"
    }).sort({ sortOrder: 1, tokenNumber: 1 });

    const topLimit = Math.min(3, queue.length);

    if (newOrder.length !== topLimit)
      return res.status(400).json({ message: "Invalid reorder request" });

    for (let i = 0; i < newOrder.length; i++) {
        await Customer.findByIdAndUpdate(newOrder[i], {
        sortOrder: i + 1
      });
    }

    let nextSortOrder = newOrder.length + 1;
    for (let i = topLimit; i < queue.length; i++) {
      if (!newOrder.includes(queue[i]._id.toString())) {
        await Customer.findByIdAndUpdate(queue[i]._id, {
          sortOrder: nextSortOrder++
        });
      }
    }

    emitSocketEvent(req.params.agentId.toString(), "queueUpdated", undefined, req.user.organizationId.toString());

    res.json({ message: "Reordered successfully" });

  } catch (err) {
    logger.error("Reorder Error", { error: err.message, stack: err.stack });
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/prioritise/:customerId", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const agentId = customer.agentId.toString();
    if (req.user.role === "AGENT" && req.user.id !== agentId) {
      return res.status(403).json({ message: "Not authorized for this queue" });
    }

    const waitingQueue = await Customer.find({ agentId, status: "waiting" }).sort({ sortOrder: 1, tokenNumber: 1 });

    let newSortOrder = 2;
    for (const p of waitingQueue) {
      if (p._id.toString() === req.params.customerId) {
        await Customer.findByIdAndUpdate(p._id, { sortOrder: 1 });
      } else {
        await Customer.findByIdAndUpdate(p._id, { sortOrder: newSortOrder++ });
      }
    }

    emitSocketEvent(agentId, "queueUpdated", undefined, customer.organizationId.toString());
    res.json({ message: "Customer prioritised successfully" });
  } catch (err) {
    logger.error("Prioritise Error", { error: err.message });
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/summary/today", auth, async (req, res) => {
  try {
    let targetAgentId = req.user.id;

    if (req.user.role === "ORG_ADMIN" || req.user.role === "OPERATOR") {
      if (req.query.agentId) {
        targetAgentId = req.query.agentId;
        const agentCheck = await User.findById(targetAgentId);
        if (!agentCheck || agentCheck.organizationId.toString() !== req.user.organizationId.toString()) {
          return res.status(403).json({ message: "Access denied to this agent's summary" });
        }
      }
    } else if (req.user.role !== 'AGENT') {
      return res.status(403).json({ message: "Summary access restricted" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysCustomers = await Customer.find({
      agentId: targetAgentId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const completed = todaysCustomers.filter(p => p.status === "completed");
    const cancelled = todaysCustomers.filter(p => p.status === "cancelled");
    const waiting = todaysCustomers.filter(p => p.status === "waiting");

    let avgSessionTime = 0;
    if (completed.length >= 2) {
      const sorted = completed.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
      let totalDelta = 0;
      for (let i = 1; i < sorted.length; i++) {
        totalDelta += (new Date(sorted[i].completedAt) - new Date(sorted[i - 1].completedAt));
      }
      avgSessionTime = Math.round(totalDelta / (sorted.length - 1) / 60000);
    }

    const hourBuckets = {};
    for (const p of todaysCustomers) {
      const hour = new Date(p.createdAt).getHours();
      hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
    }
    let busiestHour = null;
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourBuckets)) {
      if (count > maxCount) { maxCount = count; busiestHour = parseInt(hour); }
    }
    const formatHour = (h) => h === null ? "–" : `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

    res.json({
      totalToday: todaysCustomers.length,
      completed: completed.length,
      cancelled: cancelled.length,
      waiting: waiting.length,
      avgSessionTime,
      busiestHour: formatHour(busiestHour),
      noShows: cancelled.length
    });
  } catch (err) {
    logger.error("Summary Today Error", { error: err.message, stack: err.stack });
    res.status(500).json({ message: "Server error" });
  }
});

async function notifyNextInLine(agentId, organizationId) {
  try {
    const agent = await User.findById(agentId);
    if (!agent) return;

    const avgTime = agent.avgSessionTime || 5;
    const notifyCount = avgTime < 15 ? 3 : 1;

    const waitingList = await Customer.find({ agentId, status: "waiting" })
      .sort({ sortOrder: 1, tokenNumber: 1 })
      .limit(notifyCount + 1);

    if (waitingList.length < 2) return;

    const organization = await Organization.findById(organizationId);
    let locName = organization ? organization.name : "";
    let locAddress = "";

    for (let i = 1; i < waitingList.length; i++) {
      const p = waitingList[i];
      if (p.decryptFieldsSync) p.decryptFieldsSync();

      let pLocName = locName;
      if (organization && organization.locations) {
        const location = organization.locations.find(l => l._id.toString() === p.locationId.toString());
        if (location) {
          pLocName = location.name.toLowerCase() === "main" ? organization.name : `${organization.name} - ${location.name}`;
          locAddress = location.address || "";
        }
      }

      sendNearlyUpAlert(p.number, p.name, agent.name, pLocName, locAddress);
    }
  } catch (err) {
    logger.error("Notification Helper Error", err);
  }
}

module.exports = router;
