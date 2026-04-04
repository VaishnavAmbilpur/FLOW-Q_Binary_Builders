# ✂️ Salon B2B Platform (Velvet & Slate)
## Requirements & Features Document

### 1. Vision
Transform the Flow-Q B2B engine into a premium, salon-centric "Queue-as-a-Service" (QaaS) platform. The system focuses on reducing perceived wait times and providing a high-fidelity experience for "Velvet & Slate" customers.

---

### 2. Core Requirements

#### A. Headless B2B Integration
- **Platform Separation**: The frontend (Salon App) must be fully decoupled from the backend (Flow-Q API).
- **Communication**: All data must be handled via the v2 B2B API with secure `x-api-key` authentication.
- **Environment Agnostic**: Support for both local `localhost:5000` and production `onrender.com` backend nodes.

#### B. Brand Identity Translation
- **Merchant Focus**: Systematic removal of medical terminology.
  - *Doctor* → **Stylist / Merchant**
  - *Patient* → **Customer**
  - *Clinic* → **Salon / Store**
  - *Consultation* → **Service / Session**
- **Aesthetic**: Modern, "Dark-Mode" glassmorphism UI with vibrant blue and emerald accents.

#### C. Operational Efficiency
- **One-Click Checkout**: Ability for staff to mark a customer as "Visited" in a single action, automatically handling the backend "Call → Complete" state transition.
- **Live Re-indexing**: Queue positions must update in real-time as customers ahead are served.

---

### 3. Key Features

#### 🏷️ Smart Enrollment
- **Quick Check-in**: Simplified form for Customer Name and Contact Mobile.
- **Department Mapping**: Automatically maps arrivals to specific "Barber" or "Stylist" hubs.
- **Instant Tokenization**: Generates a unique Token Number and a secure Tracking Hash (UUID) upon registration.

#### 📊 Specialist Dashboard (Reception Matrix)
- **Active Queue View**: A live, polling-based list of all current customers in "Waiting" or "Serving" states.
- **Live Rank Tracking**: Displays the customer's real-time position (Rank 1, 2, 3...) for immediate staff awareness.
- **Optimistic UI**: Customers are removed from the dashboard view instantly when marked as visited.
- **Diagnostic Telemetry**: A built-in HUD showing Org ID, API Endpoint status, and sync health.

#### 📡 Live Customer Tracking
- **Tracking Link**: A standalone, mobile-responsive page accessible via a unique UUID link.
- **Visual Progress**: Real-time position updates and estimated wait time countdowns.
- **Status States**: Clear visual feedback for "Waiting", "Now Serving", and "Service Concluded".

#### 🛠️ Developer Sandbox
- **Self-Healing Provisioning**: Ability to generate a fresh Sandbox Organization and API Key directly from the dashboard for testing.
