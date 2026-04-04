# Flow-Q B2B API (QaaS) Architecture Overview

The Flow-Q B2B API is designed as a **Headless Queue-as-a-Service (QaaS)**. It allows external partners (like third-party health apps, websites, or aggregators) to programmatically manage waiting lists and appointments without using the Flow-Q dashboard directly.

---

## 1. Core Principles
- **Multi-Tenancy**: Every API request is isolated to a specific Organization/Hospital based on the API Key provided.
- **Zero-PII Compliance**: Partners can use `externalPatientId` to track patients, allowing them to keep sensitive personal data (names/phones) within their own systems.
- **Idempotency**: Critical for mobile/web apps with unstable connections. By sending an `Idempotency-Key` header, partners ensure that retried requests don't create duplicate queue entries.
- **Real-time Synchronization**: Actions taken via the API (like adding a patient) immediately trigger Socket.io events to update the live dashboards used by Doctors and Receptionists.

---

## 2. Authentication & Security
- **API Key Required**: All routes under `/api/v1/*` are protected.
- **Middleware Flow**:
    1. `requireApiKey`: Validates the key, finds the associated Hospital, and attaches it to `req.hospital`.
    2. `apiLimiter`: Enforces rate limits based on the hospital's subscription plan.
    3. `idempotencyMiddleware`: Checks if a request with the same `Idempotency-Key` was already processed.

---

## 3. Key Endpoints & Functionality

### A. Queue Management (`/v1/queue`)
- **POST `/` (Create Entry)**:
    - Generates a new `tokenNumber` for the doctor.
    - Creates a `uniqueLinkId` for live tracking.
    - **Trigger**: Dispatches a `queue.created` webhook to the partner.
    - **Sync**: Emits `queueUpdated` to the Doctor's internal dashboard.
- **DELETE `/:uniqueLinkId` (Cancel Entry)**:
    - Marks status as `cancelled`.
    - **Trigger**: Dispatches `queue.cancelled` webhook.
- **GET `/:uniqueLinkId` (Live Status)**:
    - Calculates the patient's current **Position** in line.
    - Provides an **Estimated Wait Time** (defaults to 5 mins per person ahead).

### B. Discovery & Status (`/v1/doctor`)
- **GET `/:doctorId/status`**: returns if the doctor is `"Available"` or `"Not Available"`.
- **GET `/:doctorId/queue`**: returns the full list of waiting tokens (masked identities) for that specific doctor.

### C. Appointments (`/v1/appointments`)
- **POST `/book`**: Schedules a formal appointment in the database, separate from the "on-the-spot" live queue.

---

## 4. Automation & Integration Features

### Webhooks (`webhookDispatcher.js`)
When a patient joins or leaves the queue via the API, the backend automatically sends a POST request to a URL configured by the B2B partner. This allows their system to react instantly (e.g., sending their own SMS notification).

### Branch Auto-Resolution
The API is smart enough to handle legacy data. If a doctor doesn't have a specific `branchId` assigned, the API automatically resolves it to the Hospital's "Main Branch" or creates one if it doesn't exist.

---

## 5. Technical Stack Used
- **Logic**: Node.js / Express
- **Database**: MongoDB (Mongoose)
- **Validation**: Zod (schema enforcement)
- **Documentation**: Swagger/OpenAPI (automatically generated from JSDoc comments in `apiV1Routes.js`)
- **Tracking**: Crypto (UUID generation for links)
