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
        const user = await User.findById(decoded.userId).select('organizationId role');
        if (user && user.organizationId) {
          socket.organizationId = user.organizationId.toString();
          socket.authenticated = true;
          if (user.role === 'AGENT') socket.agentId = user._id.toString();
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
    // 1. ORGANIZATION-WIDE STAFF ROOM (Authenticated)
    if (socket.authenticated && socket.organizationId) {
      const organizationRoom = `tenant:${socket.organizationId}`;
      socket.join(organizationRoom);

      socket.join(`tenant:${socket.organizationId}:${socket.role.toLowerCase()}`);
      logger.info('Staff joined organization tenant room', { role: socket.role, organizationId: socket.organizationId });
    }

    // 2. AGENT-SPECIFIC ROOM (Staff/Private)
    socket.on("joinAgentRoom", (agentId) => {
      if (!socket.authenticated || !socket.organizationId) {
        socket.emit("error", { message: "Authentication required" });
        return;
      }
      const agentRoom = `tenant:${socket.organizationId}:agent:${agentId}`;
      socket.join(agentRoom);
    });

    // 3. AGENT-SPECIFIC PUBLIC ROOM (Customers/Monitors)
    socket.on("joinAgentPublicRoom", (payload) => {
      const { organizationId, agentId } = payload;
      socket.join(`tenant:${organizationId}:public:agent:${agentId}`);
      logger.info('Customer joined agent public room', { agentId, organizationId });
    });

    // 4. ORGANIZATION-WIDE PUBLIC ROOM (TV Board)
    socket.on("joinOrganizationPublicRoom", (organizationId) => {
      socket.join(`tenant:${organizationId}:public:organization`);
      logger.info('TV Display joined organization public room', { organizationId });
    });

    // 5. VISIT-SPECIFIC ROOM (Customer Tracking)
    socket.on("joinCustomerRoom", (uniqueLinkId) => {
      socket.join(`customer:${uniqueLinkId}`);
      // Legacy backwards compatibility
      socket.join(uniqueLinkId);
      logger.info('Customer joined visit room', { uniqueLinkId });
    });

    socket.on("disconnect", () => {
      logger.debug('Socket disconnected', { userId: socket.userId });
    });
  });
};
