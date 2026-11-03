# ⚡ AI Campus Event Orchestrator

> **An Autonomous, Full-Stack University Event Management Platform powered by a 7-Agent AI Architecture.**

![AI Multi-Agent](https://img.shields.io/badge/AI_Architecture-7_Autonomous_Agents-6366f1)
![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_%7C_Tailwind-38bdf8)
![Backend](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_MongoDB-22c55e)
![Auth](https://img.shields.io/badge/Security-JWT_%7C_Role--Based_Access_Control-f59e0b)

---

## 🏛️ Project Objective

The **AI Campus Event Orchestrator** automates college event planning by replacing disconnected spreadsheets and manual forms with a synchronized **Multi-Agent AI architecture**.

When a college coordinator submits an event specification, 7 autonomous AI agents collaborate in sequence to:
1. Formulate master blueprints and estimate feasibility.
2. Cross-reference physical campus venue capacities and prevent double-bookings.
3. Synthesize chronological, non-overlapping timetables with transition buffers.
4. Calculate hardware, AV, volunteer staffing, and security apparatus requirements.
5. Perform cross-dimensional conflict audits (schedule overlaps, capacity deficits, equipment shortages, budget overages).
6. Partition actionable work packages with deadlines and assign them across campus teams.
7. Disseminate targeted departmental advisories and coordinator approval alerts.

---

## 🤖 7 Multi-Agent AI Architecture

The system features dedicated backend agent modules orchestrated by a central pipeline (`backend/ai/orchestrator.js`):

| Agent | Responsibility |
|---|---|
| **⚡ Planning Agent** | Analyzes scale, scope, feasibility score (0–100), risk rating, and initial budget split. |
| **🏛️ Venue Agent** | Checks campus venue inventory, verifies student capacity, and enforces double-booking guardrails. |
| **⏱️ Schedule Agent** | Generates chronological session timetables, registration windows, and speaker buffers. |
| **📦 Resource Agent** | Calculates required 4K projectors, wireless mics, Wi-Fi 6 access points, and volunteer/crew staffing. |
| **⚠️ Conflict Detection Agent** | Cross-audits venues, schedules, equipment inventories, and fiscal budgets; formulates mitigations. |
| **📋 Task Assignment Agent** | Creates actionable tasks with target deadlines across Venue, Tech, Volunteer, and Security teams. |
| **🔔 Notification Agent** | Prepares real-time notifications for assigned teams and flags critical conflicts for Coordinators. |

### 🔄 Dynamic Replanning & Version Comparison
If a campus facility becomes unavailable (e.g. maintenance shutdown) or a schedule clash occurs:
- The Coordinator triggers **Dynamic Replanning**.
- The AI Orchestrator re-evaluates constraints, recalibrates alternative venues or time slots, and creates a new **`EventPlanVersion`**.
- The Coordinator can compare historical iterations side-by-side with visual diffs before approving.

---

## 👥 5 Functional Campus Roles & Credentials

The platform enforces strict **Role-Based Access Control (RBAC)** across the backend API routes and frontend interfaces.

For testing and demonstration, **1-Click Instant Demo Login** is available on the login page:

| Role | Pre-Seeded Account | Password | Scope & Permissions |
|---|---|---|---|
| **Coordinator** | `coordinator@campus.edu` | `Admin@123` | Master access: View all events, create events, trigger AI planning, approve/reject plans, edit blueprints, resolve conflicts, dynamic replanning, assign & delete tasks. |
| **Venue Team** | `venue@campus.edu` | `Venue@123` | View venue deliverables, update venue inspection tasks, toggle venue maintenance status, manage room readiness. |
| **Technical Team** | `tech@campus.edu` | `Tech@123` | View equipment requirements, manage AV / sound / Wi-Fi tasks, adjust hardware inventory stock. |
| **Volunteer Team** | `volunteer@campus.edu` | `Volunteer@123` | View hospitality, check-in desk, kit distribution, and delegate guiding tasks; update progress and notes. |
| **Security Team** | `security@campus.edu` | `Security@123` | View checkpoint screening, metal detector protocol, and emergency exit clearance tasks; log safety notes. |

*Quick Role Switcher:* A 1-click role switcher pill in the navigation bar allows instant role switching during live demos!

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 & Vite
  - Tailwind CSS & Glassmorphism design system
  - Lucide React icon library
  - Recharts (Interactive category bar charts, task status donuts, team progress bars)
  - React Router DOM
- **Backend:**
  - Node.js & Express.js (Clean MVC architecture)
  - MongoDB & Mongoose
  - JWT Authentication & `bcryptjs` password hashing
  - OpenAI API integration with high-fidelity Heuristic Multi-Agent simulation fallback (100% reliable offline or without API key)
- **Database Models:**
  - `User`
  - `Event`
  - `Task`
  - `Venue`
  - `Resource`
  - `Notification`
  - `EventPlanVersion`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- MongoDB instance (e.g. `mongodb://127.0.0.1:27017`)

### 1. Database Seeding
Seed the database with pre-configured venues, hardware inventory, 5 user accounts, and sample orchestrated events:

```bash
cd backend
npm run seed
```

### 2. Start Backend Server
```bash
cd backend
npm start
```
The backend API starts on `http://localhost:5000`.

### 3. Start Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧭 Application Walkthrough

1. **Login:** Use the 1-click **Coordinator** button to enter as Dr. Sarah Jenkins.
2. **Dashboard:** View total campus events, upcoming calendar, team progress metrics, and conflict alerts.
3. **Create Event:** Click **"Plan New Event (AI)"**, input event criteria (attendees, duration, budget, sub-activities), and click **"Generate AI Event Plan"**.
4. **Agent Orchestration Modal:** Watch the animated multi-agent pipeline execute through all 7 agents.
5. **AI Planning Results:**
   - Review Feasibility Score, Risk Level, and Budget variance.
   - Inspect the interactive Schedule timetable with buffers and lead teams.
   - Verify Venue utilization % and hardware inventory allocations.
   - Audit detected conflicts and AI mitigations.
6. **Dynamic Replanning:** Click **"Dynamic Replanning"** to simulate an emergency venue relocation, generating revision v2.
7. **Version Comparison:** Click **"Compare Versions"** to compare v1 and v2 side-by-side.
8. **Approve Plan:** Click **"Approve Plan & Deploy Tasks"** — the orchestrator automatically converts the blueprint into live tasks assigned to Venue, Technical, Volunteer, and Security teams.
9. **Role Switcher:** Use the top bar **Role Switcher** to switch to **Technical Team** or **Venue Team** and view their role-tailored dashboard and task queue!
