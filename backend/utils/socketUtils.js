const logger = require('./logger');

/**
 * Safely emits socket events to various tenant-isolated rooms
 * @param {string} room - Principal room ID (e.g. doctorId or uniqueLinkId)
 * @param {string} event - Event name (e.g. 'queueUpdated')
 * @param {any} data - Data to send (optional)
 * @param {string} hospitalId - Tenant ID for isolation (required for staff rooms)
 */
const emitSocketEvent = (room, event, data, hospitalId = null) => {
    if (!global.io || typeof global.io.to !== 'function') {
        return; // Socket.io not available
    }

    // 1. HOSPITAL-WIDE STAFF ROOM: Emit to all authenticated staff (reception/doctors)
    if (hospitalId) {
        const hospitalRoom = `tenant:${hospitalId}`;
        global.io.to(hospitalRoom).emit(event, data);
    }

    // 2. DOCTOR-SPECIFIC ROOMS: Private and Public monitors
    if (hospitalId && room) {
        // Private (authenticated staff)
        const privateDoctorRoom = `tenant:${hospitalId}:doctor:${room}`;
        global.io.to(privateDoctorRoom).emit(event, data);

        // Public (unauthenticated monitors/patients)
        const publicDoctorRoom = `tenant:${hospitalId}:public:doctor:${room}`;
        global.io.to(publicDoctorRoom).emit(event, data);
    }

    // 3. VISIT-SPECIFIC ROOM: Direct patient tracking
    if (room && room.length > 20) { // Likely a UUID or Object ID
        const patientRoom = `patient:${room}`;
        global.io.to(patientRoom).emit(event, data);
        // Legacy room for backwards compatibility
        global.io.to(room).emit(event, data);
    }

    // 4. HOSPITAL PUBLIC DISPLAY: TV Board
    if (hospitalId) {
        const publicHospitalRoom = `tenant:${hospitalId}:public:hospital`;
        global.io.to(publicHospitalRoom).emit(event, data);
    }

    logger.debug(`Socket Event Emitted: ${event}`, { room, hospitalId });
};

module.exports = { emitSocketEvent };
