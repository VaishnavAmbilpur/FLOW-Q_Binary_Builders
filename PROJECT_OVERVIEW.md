# 🏥 FLOW-Q: Intelligent Patient Flow System

## 🌟 Overview
**FLOW-Q** is a modern, multi-tenant queue management and patient flow optimization platform designed for medical clinics and hospitals. It eliminates physical waiting room congestion by providing real-time tracking, automated check-ins, and doctor-priority dashboards.

---

## 🏗️ System Architecture

### 1. **Technology Stack**
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose)
*   **Frontend**: Next.js (App Router), Tailwind CSS, Lucide Icons, Framer Motion
*   **Real-time**: Socket.io (for instant queue updates)
*   **Authentication**: Passport.js (JWT + Google OAuth 2.0)
*   **Deployment**: Render (Backend) & Vercel (Frontend)

### 2. **Multi-Tenant Model**
The system supports multiple **Hospitals**. Each Hospital can have multiple **Branches**, and each Branch can host multiple **Doctors/Specialists**. 

| Entity | Role |
| :--- | :--- |
| **HOSPITAL_ADMIN** | Manages clinicians, staff, and hospital-wide settings. |
| **DOCTOR** | Manages their own live queue and consults patients. |
| **RECEPTIONIST** | Handles manual check-ins and cross-doctor queue management. |
| **PATIENT** | Self-checks in via Kiosk and tracks status via unique live links. |

---

## ⚡ Core Features

### 🏢 Kiosk & Self Check-In
*   **QR-Enabled**: Patients scan a QR code at the clinic or scan the physical Kiosk.
*   **Smart Selection**: Patients choose their doctor and view real-time estimated wait times.
*   **Automated Tracking**: Upon check-in, the system:
    1.  Assigns a unique **token number** (sequential for the day).
    2.  Generates a **unique tracking link**.
    3.  Copies the link to the patient's clipboard.
    4.  Redirects the patient to their **Live Tracking Dashboard**.

### 🩺 Doctor Dashboard
*   **Live Queue**: Real-time view of waiting patients via WebSockets.
*   **Patient Lifecycle**: Doctors can "Finalize" (complete) or "Cancel" visits.
*   **Priority Controls**: Ability to reorder or prioritize patients (Matrix Flow).
*   **Analytics**: Daily summary of total seen, average consultation time, and busiest hours.

### 📍 Live Tracking (Patient View)
*   **Dynamic Wait Times**: Calculated based on the doctor's average consultation speed and current queue position.
*   **Instant Alerts**: Auto-refreshes when the doctor completes a previous visit.

---

## 🛠️ Key Technical Implementations

### 1. **Hybrid Authentication Strategy**
To support the cross-origin setup (Render Backend <-> Vercel Frontend), we implemented a dual-mode auth system:
*   **HttpOnly Cookies**: Standard secure session management for same-site security.
*   **Bearer Tokens**: A fallback `Authorization` header strategy. After login/signup, the backend returns an `accessToken`. The frontend interceptor attaches this to every request (`Bearer <token>`).

### 2. **Sequential Token Generation**
Unlike basic systems that reset to #1 whenever the queue is empty, FLOW-Q tracks total patients seen per doctor per day.
*   `tokenNumber = (Total Daily Count) + 1`
*   `sortOrder`: Ensures Kiosk check-ins always appear at the **bottom** of the current waiting list.

### 3. **Production Stability (Render + Vercel)**
*   **Keep-Alive Ping**: A `setInterval` in `server.js` pings the health endpoint every 14 minutes to prevent Render's free tier from spinning down.
*   **CORS Hardening**: Explicitly whitelist `localhost:3000` and the production Vercel domain to prevent blocked requests.
*   **Proxy Trust**: Configured `trust proxy` in Express to allow secure cookies to pass through Render's load balancer.

---

## 🚀 Deployment Guide

### **Backend (Render)**
Set the following environment variables:
*   `NODE_ENV`: `production`
*   `FRONTEND_URL`: `https://flow-q-binary-builders.vercel.app`
*   `MONGO_URI`: Your MongoDB Atlas string.
*   `JWT_SECRET`: For session security.
*   `GOOGLE_CLIENT_ID / SECRET`: (Optional) For OAuth.

### **Frontend (Vercel)**
Set the following environment variables:
*   `NEXT_PUBLIC_API_BASE_URL`: `https://flow-q-binary-builders.onrender.com/api`
*   `NEXT_PUBLIC_SOCKET_URL`: `https://flow-q-binary-builders.onrender.com`

---

## 🔒 Data Security & PII
*   **Field Encryption**: Sensitive patient data (Name, Phone) is encrypted at the database level using `mongoose-field-encryption`.
*   **Secure Redirects**: Google OAuth tokens are captured from the URL and immediately wiped from the browser history to prevent leakage.

---

**© 2026 SmartQueue Global // FLOW-Q System Documentation**
