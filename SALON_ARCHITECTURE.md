# ✂️ Salon B2B Platform (Velvet & Slate)
## Technical Architecture: Frontend & Backend

This document details the decoupled "Headless" architecture used to power the Velvet & Slate Salon experience.

---

### 🎨 Frontend: The "Luxury UI" (Next.js)
The frontend is a specialized, dark-themed experience designed for high-end service hubs.

- **Stack**: Next.js 16+, Typescript, TailwindCSS 4, Lucide Icons.
- **Architecture**:
  - **Reception Dashboard**: A mission-control interface for salon staff using real-time polling to sync with the Render backend.
  - **Tracking Hub**: A standalone, mobile-responsive page using unique UUIDs (`/status/[id]`) to show live customer progress.
  - **Diagnostic HUD**: A real-time telemetry sensor in the dashboard that monitors system throughput and API health.
- **Advanced Logic**:
  - **Optimistic UI**: Buttons perform instant local state updates to eliminate perceived latency.
  - **Action Chaining**: The "Visited" button automatically chains two API calls (`Call` → `Complete`) into a single user action.

---

### ⚙️ Backend: The "B2B Engine" (Node.js/Express)
The backend acts as a headless "Queue-as-a-Service" (QaaS) platform, managing thousands of organizational nodes.

- **Stack**: Node.js, Express, MongoDB Atlas, Socket.io (for real-time events).
- **Core API Features**:
  - **v2 B2B API**: An external-facing REST API designed for headless integrations.
  - **Security**: Robust `x-api-key` validation with organizational partitioning.
  - **Sandbox Provisioning**: Dedicated `/demo/provision` endpoint for creating merchant environments in seconds.
- **Data Model**:
  - **Organization-Centric**: Supports multi-tenant isolation (Independent Salon nodes).
  - **Unified Queue Entry**: High-performance record tracking for "Waiting", "Serving", and "Completed" states.
  - **UUID Tracking**: Secure v4 UUID generation for all tracking links to prevent unauthorized access.

---

### 📉 Communication Model
- **Request Type**: JSON/Axios.
- **Endpoints**: `onrender.com/api/v2/...`
- **Polling Intervals**: 
  - **Dashboard**: Every 5 seconds for broad sync.
  - **Status Page**: Every 3 seconds for precise visitor tracking.
