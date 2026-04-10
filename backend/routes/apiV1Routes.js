const express = require('express');
const router = express.Router();
const { requireApiKey } = require('../middleware/apiAuth');
const { apiLimiter } = require('../middleware/apiRateLimiter');
const idempotencyMiddleware = require('../middleware/idempotency');
const { createQueueEntry, getAgentStatus, getQueueStatus, deleteQueueEntry, getAgentQueue, bookApiAppointment } = require('../controllers/apiV1Controller');

// All v1 B2B routes require an API Key and are rate-limited
router.use(requireApiKey);
router.use(apiLimiter);

// ----------------------------------------------------------------------
// B2B Queue Management Endpoints
// ----------------------------------------------------------------------

/**
 * @swagger
 * /v1/queue:
 *   post:
 *     summary: Add a new customer to the queue
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Optional idempotency key to prevent duplicate check-ins
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agentId]
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: ID of the agent to queue for
 *               externalCustomerId:
 *                 type: string
 *                 description: Optional External Customer ID for Zero-PII masking
 *               name:
 *                 type: string
 *                 description: Optional customer name
 *               description:
 *                 type: string
 *                 description: Reason for visit
 *     responses:
 *       201:
 *         description: Customer successfully added to the queue
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid API Key
 *       429:
 *         description: Rate limit exceeded
 */
// Add customer to queue
// Expects: agentId, externalCustomerId (optional), name (optional), description (optional), Header: Idempotency-Key (optional)
router.post('/queue', idempotencyMiddleware, createQueueEntry);

/**
 * @swagger
 * /v1/queue/{uniqueLinkId}:
 *   delete:
 *     summary: Cancel a customer's queue entry
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: uniqueLinkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique link ID of the queue entry
 *     responses:
 *       200:
 *         description: Queue entry successfully cancelled
 *       404:
 *         description: Queue entry not found
 */
// Update/Cancel existing queue entry
router.delete('/queue/:uniqueLinkId', deleteQueueEntry);

/**
 * @swagger
 * /v1/queue/{uniqueLinkId}:
 *   get:
 *     summary: Get live queue status and estimated wait time for a customer
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: uniqueLinkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique link ID of the queue entry
 *     responses:
 *       200:
 *         description: Queue status retrieved successfully
 *       404:
 *         description: Queue entry not found
 */
// Get queue status
router.get('/queue/:uniqueLinkId', getQueueStatus);

// ----------------------------------------------------------------------
// B2B Agent Management Endpoints
// ----------------------------------------------------------------------

/**
 * @swagger
 * /v1/agent/{agentId}/queue:
 *   get:
 *     summary: Get all actively queued customers for an agent
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the agent
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
 *       404:
 *         description: Agent not found
 */
// Get Agent live queue list
router.get('/agent/:agentId/queue', getAgentQueue);

/**
 * @swagger
 * /v1/agent/{agentId}/status:
 *   get:
 *     summary: Get current availability status of an agent
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the agent
 *     responses:
 *       200:
 *         description: Status retrieved successfully
 *       404:
 *         description: Agent not found
 */
// Get Agent status (availability)
router.get('/agent/:agentId/status', getAgentStatus);

// ----------------------------------------------------------------------
// B2B Appointment Endpoints
// ----------------------------------------------------------------------

/**
 * @swagger
 * /v1/appointments/book:
 *   post:
 *     summary: Book an appointment for a customer
 *     tags: [B2B API]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agentId, customerName, phone, scheduledAt]
 *             properties:
 *               agentId:
 *                 type: string
 *               customerName:
 *                 type: string
 *               phone:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 */
router.post('/appointments/book', bookApiAppointment);

module.exports = router;
