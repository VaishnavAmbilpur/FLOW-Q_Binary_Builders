# Smart-Queue B2B External API — Implementation Guide

Smart-Queue offers a robust, multi-tenant **Queue-as-a-Service (QaaS)** platform designed for developers and enterprise partners. This guide explains how to leverage our **Headless B2B API (v2)** to integrate real-time queue management and appointment scheduling into your own existing applications.

---

## 🏗️ 1. Core Architecture: Headless QaaS

Unlike standard queue systems that force you to use their UI, Smart-Queue B2B is **Headless**. 

- **Smart-Queue Backend**: Handles the complex logic of slot generation, token sequencing, real-time push updates via WebSockets, and data retention.
- **Your Application (The Partner)**: You build the front-end experience (Mobile App, Web Portal, Kiosk) and simply call our API for the "brain" of the queue.

### Key Data Entities (v2):
- **Organization**: The top-level tenant (e.g., a hospital chain or bank).
- **Location**: Physical branches or virtual hubs.
- **Service**: What is being offered (e.g., "General Checkup", "Wealth Management").
- **Agent**: The personnel serving the clients (e.g., Doctors, Tellers).
- **QueueEntry**: A client currently in the live system.
- **Appointment**: A scheduled visit linked to a service/agent.

---

## 🔑 2. Authentication & Security

### API Key Authentication
All requests must include a valid API key in the request header. We use a **prefixed, hashed key system** for maximum security.

**Header:** `x-api-key: sq_live_PUBID_SECRET`

### HMAC Webhook Signatures
To ensure that webhook events are genuine and sent by Smart-Queue, every payload is signed using **HMAC SHA-256**. You should verify this signature in your endpoint before processing the data.

**Header:** `x-sq-signature: <hmac-signature>`

---

## 📡 3. Key API Endpoints (v2)

### 🏥 Organization Discovery
Used to build your native UI based on the services available in the clinic.
- `GET /api/v2/info`: Get organization profile and settings.
- `GET /api/v2/services`: List active services and their average wait times.
- `GET /api/v2/agents`: List available providers for a specific service.

### 📅 Appointment Layer
Advanced slot generation that respects provider schedules and capacity.
- `GET /api/v2/services/:id/slots?date=YYYY-MM-DD`: Get available 15-min slots.
- `POST /api/v2/appointments/book`: Schedule a visit.
- `PUT /api/v2/appointments/:id/arrive`: **The Transition** — Converges a scheduled appointment into the Live Queue.

### ⚡ Live Queue Management
The engine that runs the physical waiting room.
- `POST /api/v2/queue`: Add a walk-in client (generates a `tokenNumber`).
- `GET /api/v2/queue/:uniqueLinkId`: Get live position, ETA, and serving status.
- `DELETE /api/v2/queue/:uniqueLinkId`: Cancel a queue entry if the client leaves.
- `GET /api/v2/queue/stats`: Real-time volume monitoring (Total waiting, serving, avg wait).

---

## 🛡️ 4. Enterprise-Grade Reliability

### Idempotency Keys (`Idempotency-Key`)
Prevents double-bookings or accidental dual-registrations caused by network retries. If you send the same key twice within 24 hours, the API returns the original cached response.

### Zero-PII (Patient Identifiable Information) Strategy
Smart-Queue allows for **Complete Anonymization**. You can pass an `externalClientId` (your internal database ID) instead of the client's name.
- Your app keeps the private client data.
- Smart-Queue handles only the "Token ID" and "Position".
- **Result**: Zero HIPAA/GDPR liability on the queue layer.

---

## 🔗 5. Real-Time Webhooks

Stay updated without polling. Configure your `Webhook URL` in the Admin Dashboard to receive events:

- `queue.created`: Fired when a new client joins.
- `queue.serving`: Fired when an agent "calls" the next client.
- `queue.completed`: Fired when the visit ends.
- `agent.status_changed`: Fired when a provider goes on break or pause.

---

## 🧪 6. Reference Implementation (`b2b-demo-app`)

We have included a full **Next.js 14** demo application in the `b2b-demo-app` directory. This application demonstrates:
1. Fetching available services and slots.
2. Booking an appointment via the API.
3. Simulating a Kiosk "Arrival" check-in.
4. **Live Tracking**: A custom dashboard that polls the B2B API to show real-time position and wait time.

---

## 🚦 7. Rate Limiting & Quotas

Smart-Queue enforces tiered rate limiting to ensure system stability:
- **Starter**: 1,000 requests / month.
- **Growth**: 10,000 requests / month.
- **Enterprise**: Custom quotas + priority support.

You can monitor your usage in real-time via the `X-RateLimit-Remaining` response headers.
