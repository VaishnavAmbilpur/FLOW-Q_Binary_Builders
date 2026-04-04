# ✂️ Salon B2B Platform (Velvet & Slate)
## Technical Blueprint: Requirements, Features & Flow

This document serves as the comprehensive technical guide for the "Velvet & Slate" salon queue management integration.

---

### 🏛️ Technical Requirements
- **Frontend Stack**: Next.js 16+ (TSX), TailwindCSS 4, Lucide Icons, Axios.
- **Backend Stack**: Node.js/Express v2 B2B API (Hosted on Render).
- **Authentication**: `x-api-key` header-based security using prefixes (`sq_test_...`).
- **Data Persistence**: MongoDB Atlas (Storage) & Socket.io (Real-time events).
- **Communication Layer**: Polling-based architecture (Dashboard: 5s, Status Page: 3s).

---

### ✨ Core Features
- **Merchant Sandbox**: Provision a fresh organization node and API key directly from the dashboard.
- **Reception Matrix**: A unified "Mission Control" for salon receptionists to manage arrivals.
- **Live Rank Board**: Converts static tokens into real-time numerical positions (1, 2, 3...).
- **Intelligent Feedback**: Automated "Customer Visited" logic with optimistic UI clearing.
- **Status Sharing**: Secure unique UUID links for customers to monitor their progress remotely.
- **Diagnostic HUD**: Real-time telemetry monitoring for API status and sync integrity.

---

### 🌊 Operational Flow

#### 1. Onboarding
The system initiates by fetching merchant metadata (`GET /info`). If no session exists, the receptionist can trigger a **Demo Provisioning** (`POST /demo/provision`) to setup a new salon environment.

#### 2. Customer Ingress
- **Check-in**: Staff enters customer details (`POST /queue/check-in`).
- **Tracking**: The system issues a `uniqueLinkId` which is shared with the customer.

#### 3. Queue Lifecycle
- **Waiting**: The customer's status is `waiting`. The status page displays their current Rank and estimated wait.
- **The "One-Click" Visit**: When the stylist is ready, the receptionist clicks the **Tick Button**.
- **The "High-Speed" Sequence**: To satisfy backend state rules, the app performs a silent **Call (Serving) → Complete (Visited)** sequence instantly.
- **Removal**: The customer is removed from the active list, and the remaining customers' ranks are immediately re-indexed (-1).

#### 4. Diagnostic Loop
Continuous health checks monitor connection status. If the Render backend spins down, the "Diagnostic Telemetry" board alerts the staff immediately.
