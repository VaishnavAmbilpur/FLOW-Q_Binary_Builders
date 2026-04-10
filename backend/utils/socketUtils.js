const logger = require('./logger');

/**
 * Safely emits socket events to various tenant-isolated rooms
 * @param {string} room - Principal room ID (e.g. agentId or uniqueLinkId)
 * @param {string} event - Event name (e.g. 'queueUpdated')
 * @param {any} data - Data to send (optional)
 * @param {string} organizationId - Tenant ID for isolation (required for staff rooms)
 */
const emitSocketEvent = (room, event, data, organizationId = null) => {
    if (!global.io || typeof global.io.to !== 'function') {
        return; // Socket.io not available
    }

    // 1. ORGANIZATION-WIDE STAFF ROOM: Emit to all authenticated staff (operators/agents)
    if (organizationId) {
        const organizationRoom = `tenant:${organizationId}`;
        global.io.to(organizationRoom).emit(event, data);
    }

    // 2. AGENT-SPECIFIC ROOMS: Private and Public monitors
    if (organizationId && room) {
        // Private (authenticated staff)
        const privateAgentRoom = `tenant:${organizationId}:agent:${room}`;
        global.io.to(privateAgentRoom).emit(event, data);

        // Public (unauthenticated monitors/customers)
        const publicAgentRoom = `tenant:${organizationId}:public:agent:${room}`;
        global.io.to(publicAgentRoom).emit(event, data);
    }

    // 3. VISIT-SPECIFIC ROOM: Direct customer tracking
    if (room && room.length > 20) { // Likely a UUID or Object ID
        const customerRoom = `customer:${room}`;
        global.io.to(customerRoom).emit(event, data);
        // Legacy room for backwards compatibility
        global.io.to(room).emit(event, data);
    }

    // 4. ORGANIZATION PUBLIC DISPLAY: TV Board
    if (organizationId) {
        const publicOrganizationRoom = `tenant:${organizationId}:public:organization`;
        global.io.to(publicOrganizationRoom).emit(event, data);
    }

    logger.debug(`Socket Event Emitted: ${event}`, { room, organizationId });
};

module.exports = { emitSocketEvent };
