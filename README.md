# Flow-q 

> **Next-Gen Real-Time Queue & Appointment Management SaaS**

**Flow-q** is a multi-tenant, real-time platform designed to eliminate physical waiting lines. By digitizing the queue experience, Flow-q allows businesses—from healthcare clinics to bank branches—to manage customer flow through a live dashboard, while providing customers with a transparent, stress-free waiting experience via their mobile devices.

---

## 👥 Our Team

* **Nadam Eshwanth Raj**
* **Vaishnav Ambilpur**
* **Vangala Varshith Reddy**
* **Balaka Laluth Vardhan**

---

## 🛑 The Problem: The "Waiting" Crisis
In traditional service sectors, physical queues lead to:
* **Congested Waiting Rooms:** Increased health risks and customer frustration.
* **Zero Visibility:** Customers have no idea of their estimated wait time.
* **Operational Inefficiency:** Staff manage flow via manual logs, leading to errors and "no-show" dead air.

## 🟢 The Solution: Flow-q
We bridge the gap between service providers and customers through:
1.  **Instant Digital Check-in:** Customers scan a QR code to join the queue instantly—no app download required.
2.  **Live Position Tracking:** A personalized tracking page showing "People ahead of you" and "Estimated Wait Time."
3.  **Staff Command Center:** A real-time dashboard for providers to call, pause, or complete sessions with a single click.
4.  **Multi-Tenant Architecture:** A single robust system capable of hosting hundreds of different organizations in total isolation.

---

## 🛠️ Technical Architecture

| Layer | Technology | Key Implementation |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** | Server-Side Rendering (SSR) for ultra-fast status page loads. |
| **Backend** | **Node.js / Express** | Event-driven architecture to handle high-concurrency events. |
| **Real-Time** | **Socket.io** | Persistent WebSockets providing **<100ms** status sync across all devices. |
| **Database** | **MongoDB** | Multi-tenant schema design with strict data isolation and indexing. |
| **Security** | **JWT / Cookies** | Secure authentication using Refresh Token Rotation and HTTP-only cookies. |
| **Monitoring** | **Sentry** | Full-stack error tracking and performance bottleneck identification. |

---

## 🚀 Core Features

### ⚡ Real-Time Synchronization
Utilizing WebSockets, any action taken by a staff member (like calling the next token) is instantly reflected on the patient's phone and the lobby display without a page refresh.

### 🛡️ Secure B2B "Headless" API
Flow-q isn't just a website; it's a platform. We offer a secure API layer (using API Keys) that allows other businesses to integrate our queue logic into their own custom applications.

### 🔒 Enterprise-Grade Security
* **Refresh Token Rotation:** Prevents session hijacking.
* **Zero-PII Option:** Businesses can use anonymous identifiers to ensure customer privacy and data compliance.
* **Robust Data Backups:** Integrated scripts for daily MongoDB backups with Gzip compression and retention policies.

---

## 📦 Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* MongoDB (Local or Atlas)

### Local Development
1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/your-org/flow-q.git](https://github.com/your-org/flow-q.git)
    cd flow-q
    ```
2.  **Configuration**
    Create `.env` files in both `/backend` and `/frontend-next` based on the provided `.env.example` templates.
3.  **Start Backend**
    ```bash
    cd backend
    npm install
    npm run dev
    ```
4.  **Start Frontend**
    ```bash
    cd ../frontend-next
    npm install
    npm run dev
    ```

---

## 🔮 Future Roadmap
* **AI Analytics:** Predictive wait-time calculations based on historical staff speed.
* **SMS Integration:** Fallback notifications for users without active data connections.
* **Advanced Scheduling:** Calendar-syncing for hybrid "Walk-in + Appointment" management.

---

*Flow-q was built for the 2026 Hackathon to solve the universal problem of waiting. We give every person a number, a time, and peace of mind.*
