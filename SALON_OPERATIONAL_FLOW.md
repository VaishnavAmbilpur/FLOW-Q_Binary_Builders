# ✂️ Salon B2B Platform (Velvet & Slate)
## Operational Flow Document

### 1. Initialization & Handshake
1. **Org Provisioning**: The "Velvet & Slate" organization is established in the Flow-Q Matrix.
2. **Key Generation**: A secure `sq_test_...` (Prefix) API key is issued.
3. **App Discovery**: The Salon App performs a `GET /v2/info` call to verify API health and Org ID.

---

### 2. Walk-In Customer Journey

#### 🚀 Phase A: Enrollment
1. **Check-In**: Customer arrives at the salon and provides their name/phone.
2. **API Call**: The Salon App triggers a `POST /api/v2/queue/check-in` request.
3. **Link Generation**: The API returns a `uniqueLinkId` (e.g., `status/abcd-1234`).
4. **Toast Confirmation**: Staff sees "Customer registered ✓".

#### 📡 Phase B: Real-Time Tracking
1. **SMS/Link**: The customer opens their unique tracking link.
2. **Polling**: The status page (`status/[id]/page.tsx`) polls the `v2/queue/:id` endpoint every 3 seconds.
3. **Wait Logic**: Estimated wait is recalculated dynamically based on:
   - `Position in Line` ✖ `Service Duration` (Avg 15 mins).
4. **Status States**:
   - **Waiting**: Blue theme. Shows Rank (e.g., "3rd in line").
   - **Now Serving**: Pulse effect. Instruction: "Proceed to Stylist".
   - **Service Concluded**: Emerald theme. Marked as "Completed".

---

### 3. Merchant/Barber Management

#### 💈 Phase C: Queue Oversight
1. **Poll Loop**: The Staff Dashboard (`app/page.tsx`) polls `v2/queue` every 5 seconds.
2. **Rank Re-indexing**: All visible customers are mapped to live Ranks (1, 2, 3...) to show exactly who is next.
3. **Monitoring**: Staff tracks "Active in Service-Flow" count.

#### ✅ Phase D: The "Visited" Action (The One-Click Workflow)
1. **Initial State**: Customer `Status` is **"Waiting"**.
2. **Staff Click**: Barber clicks the 🟢 **Tick Button**.
3. **Optimistic UI**: The customer is *immediately* removed from the local dashboard view.
4. **Action Sequence**: To satisfy backend state logic, the dashboard automatically executes:
   - **PATCH /action → "call"** (Moves them to "Serving").
   - **PATCH /action → "complete"** (Marks them as "Visited").
5. **Final State**: Customer `Status` becomes **"Completed"** on Render. The status link is invalidated.

---

### 4. System Cleanup
1. **Re-sync**: The dashboard calls `loadQueue()` once more to confirm the removal.
2. **Position Update**: All remaining customers in the queue move up by **-1** rank automatically.
