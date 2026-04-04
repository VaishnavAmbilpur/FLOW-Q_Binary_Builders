# 🚀 Flow-Q Platform: Full-Stack Architecture
## Backend Engine & Frontend Ecosystem

This document provides a technical deep-dive into the core Flow-Q platform, powering both the enterprise dashboard and the HEADLESS B2B ecosystem.

---

### ⚙️ The Backend: Multi-Tenant Engine (Node.js/Express)
The backend is a high-performance orchestration layer designed for multi-tenant scalability and robust data integrity.

- **Architecture**: Domain-Driven Design (DDD) with clear separation of routes, models, and middleware.
- **Core Components**:
  - **Multi-Tenancy**: Complete isolation between "Organizations" (Orgs). Each Org owns its Locations, Services, and Agents.
  - **Headless API (v2)**: A specialized, documentation-rich REST API for external integrations (like the Salon Demo).
  - **Security & RBAC**: Advanced Role-Based Access Control (SuperAdmin, OrgAdmin, Agent, Operator).
  - **Event Bus (Webhooks)**: Dispatches `queue.created`, `queue.completed`, and `agent.status` events to third-party endpoints.
- **Stability Features**:
  - **Audit Logging**: Every mutation (PATCH/DELETE) is tracked for compliance.
  - **PII Filtering**: Automatic masking of sensitive customer data for developer-level API access.
  - **Sentry Integration**: Global error tracking and performance monitoring.

---

### 🎨 The Frontend: High-Fidelity Ecosystem (Next.js)
The primary dashboard (`frontend-next`) is a premium interface built for speed and visual excellence.

- **Stack**: Next.js 16+, Typescript, Framer Motion (Animations), Socket.io-client.
- **Advanced UI/UX**:
  - **3D Visualizations**: Integration of **Three.js** and **React Fiber** for high-fidelity interactive elements.
  - **Framer Motion Elements**: Liquid-smooth transitions and micro-animations for status updates.
  - **Live Socket Mesh**: Every dashboard node receives instant push notifications when the queue state changes.
- **Theme Engine**: Centralized design system with curated color palettes and "Glassmorphism" layers.

---

### 📡 Data & Communication
- **Real-Time Sync**: Hybrid approach using both **WebSockets** (for dashboards) and **REST Polling** (for standalone tracking pages).
- **Database**: MongoDB with **PII Masking** on specific sensitive fields.
- **Connectivity**: Fully operational across Render (Production) and local node environments.
