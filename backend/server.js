const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// console.clear();
console.log('----------------------------------------------------');
console.log('🚀 SYSTEM BOOT: SmartQueue Backend');
console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Initializing on Port: ${process.env.PORT || 5000}`);
console.log('----------------------------------------------------');

const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const queueRoutes = require('./routes/queueRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require('./routes/authRoutes');
const apiV1Routes = require('./routes/apiV1Routes');
const apiV2Routes = require('./routes/apiV2Routes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kioskRoutes = require('./routes/kioskRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const sentry = require('./config/sentry');
const swaggerSpec = require('./config/swagger');

const { initScheduleCron } = require('./cron/scheduleCron');
const { initReminderCron } = require('./cron/reminderCron');
const { initDataRetentionCron } = require('./cron/dataRetentionCron');
const { initDsrEraserCron } = require('./cron/dsrEraserCron');
const { initTelegramBot } = require('./utils/telegramBot');

connectDB();

// Initialize automated scheduled jobs and services
if (process.env.NODE_ENV !== 'test') {
  initScheduleCron();
  initReminderCron();
  initDataRetentionCron();
  initDsrEraserCron();

  // Start Telegram Bot Polling
  initTelegramBot();
}

const app = express();
app.set("trust proxy", 1);

// Initialize Sentry (must be before any other middleware)
sentry.initSentry(app);

// Sentry request handler (must be first middleware)
app.use(sentry.requestHandler());

// Sentry tracing handler
app.use(sentry.tracingHandler());

// CORS Configuration (must come before other middleware)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  // Explicitly allowing common headers to prevent Axios Network Errors on preflight
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "Idempotency-Key", "Accept", "X-Requested-With", "Cache-Control", "sentry-trace", "baggage", "origin"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use(globalLimiter);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation - The Developer Portal (The Interface for getting keys)
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dev-portal.html'));
});

// The Raw API Reference (Swagger)
app.use('/api-docs/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Smart Queue API Documentation'
}));

// Security Middleware (after API Docs)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "frame-ancestors": ["'self'", "http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL].filter(Boolean)
    }
  },
  xFrameOptions: false
}));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json());
const passport = require('passport');
app.use(passport.initialize());


// Request logging middleware
app.use(requestLogger);

// Setup PII Output Filtering (Dependent on auth/hospital loading where applicable)
// Applied early enough so all JSON responses pass through its maskPii mechanism.
const piiFilterMiddleware = require('./middleware/piiFilter');
app.use(piiFilterMiddleware);

// Setup multi-tenant logic isolation 
const tenantIsolationMiddleware = require('./middleware/tenantIsolation');
app.use(tenantIsolationMiddleware);

// Setup Audit Logging for compliance tracking on mutations
const auditLogger = require('./middleware/auditLogger');
app.use(auditLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Internal Legacy UI Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/kiosk', kioskRoutes);

// B2B QaaS External Headless Routes
app.use('/api/v1', apiV1Routes);
app.use('/api/v2', apiV2Routes);

// Error handling middleware (must be after all routes)
app.use(notFoundHandler);
app.use(errorLogger);

// Sentry error handler (must be before other error handlers)
app.use(sentry.errorHandler());

app.use(errorHandler);

const server = http.createServer(app);

// SOCKET IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
    credentials: true
  }
});


global.io = io;
require("./socket/queueSocket")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Trigger nodemon restart
