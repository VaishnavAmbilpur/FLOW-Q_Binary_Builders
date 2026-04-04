const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User');

module.exports = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.role = decoded.role;
        const user = await User.findById(decoded.userId).select('hospitalId role');
        if (user && user.hospitalId) {
          socket.hospitalId = user.hospitalId.toString();
          socket.authenticated = true;
          if (user.role === 'DOCTOR') socket.doctorId = user._id.toString();
        } else {
          socket.authenticated = false;
        }
      } catch (err) {
        socket.authenticated = false;
      }
    } else {
      socket.authenticated = false;
    }
    next();
  });

  io.on("connection", (socket) => {
    // 1. HOSPITAL-WIDE STAFF ROOM (Authenticated)
    if (socket.authenticated && socket.hospitalId) {
      const hospitalRoom = `tenant:${socket.hospitalId}`;
      socket.join(hospitalRoom);

      socket.join(`tenant:${socket.hospitalId}:${socket.role.toLowerCase()}`);
      logger.info('Staff joined hospital tenant room', { role: socket.role, hospitalId: socket.hospitalId });
    }

    // 2. DOCTOR-SPECIFIC ROOM (Staff/Private)
    socket.on("joinDoctorRoom", (doctorId) => {
      if (!socket.authenticated || !socket.hospitalId) {
        socket.emit("error", { message: "Authentication required" });
        return;
      }
      const doctorRoom = `tenant:${socket.hospitalId}:doctor:${doctorId}`;
      socket.join(doctorRoom);
    });

    // 3. DOCTOR-SPECIFIC PUBLIC ROOM (Patients/Monitors)
    socket.on("joinDoctorPublicRoom", (payload) => {
      const { hospitalId, doctorId } = payload;
      socket.join(`tenant:${hospitalId}:public:doctor:${doctorId}`);
      logger.info('Patient joined doctor public room', { doctorId, hospitalId });
    });

    // 4. HOSPITAL-WIDE PUBLIC ROOM (TV Board)
    socket.on("joinHospitalPublicRoom", (hospitalId) => {
      socket.join(`tenant:${hospitalId}:public:hospital`);
      logger.info('TV Display joined hospital public room', { hospitalId });
    });

    // 5. VISIT-SPECIFIC ROOM (Patient Tracking)
    socket.on("joinPatientRoom", (uniqueLinkId) => {
      socket.join(`patient:${uniqueLinkId}`);
      // Legacy backwards compatibility
      socket.join(uniqueLinkId);
      logger.info('Patient joined visit room', { uniqueLinkId });
    });

    socket.on("disconnect", () => {
      logger.debug('Socket disconnected', { userId: socket.userId });
    });
  });
};
