# Frontend Mission: The Face of Blue Carbon Restoration

Welcome, developer. You're not just building a user interface; you're creating the digital window into India's fight against climate change. This application will empower coastal communities, NGOs, and researchers by making their vital blue carbon restoration work visible, verifiable, and impactful.

Every component you build, every user interaction you design, brings us one step closer to a transparent and effective system for healing our planet. Let's build something that matters.

---

## 🎯 Our Objective: Empowering Users Through Design

Your mission is to create a clean, intuitive, and responsive frontend experience for the two primary users who will bring this registry to life. The interface should feel supportive and focused, allowing them to perform their crucial tasks without friction.

### The User Journeys

* **Neha, the NGO Manager:** Her journey begins with registering her community's new mangrove plantation project. She'll use the dashboard you build to proudly upload photos and notes, tracking her project's progress from "Pending" to "Approved." Her work will finally have the visibility it deserves.

* **Dr. Sharma, the NCCR Verifier:** He needs an efficient and clear dashboard to review the incredible work being done by NGOs across the country. Your interface will give him a bird's-eye view of all projects, allowing him to easily access details and confidently approve their status, ensuring the integrity of the entire system.

---

## 📋 Key Views to Build

This is the core feature set for the frontend. The backend is ready and waiting for this interface to bring it to life.

- **Authentication Pages:**
  - A welcoming **Login** form.
  - A simple **Registration** form where users can select their role (NGO, Admin, etc.).

- **NGO Dashboard:**
  - A main view displaying a **list of the NGO's projects** (perhaps as cards).
  - A clear button to **"Create New Project"** that opens a form.
  - A **Project Detail Page** that shows all project info and lists its progress updates.
  - An easy-to-use **form for submitting a new update** with notes and an image.

- **Admin Dashboard:**
  - An efficient **table view of all projects** from all NGOs.
  - Each row in the table should have buttons to **"Approve"** or **"Reject"** a project.
  - A **Project Detail Page** to review all information before making a verification decision.

---

## 🔌 Connecting to the Backend API

The backend is fully operational. Here are the key endpoints you'll need to connect the UI to. Remember to handle the JWT token for authenticated requests.

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Create a new user account. |
| `POST` | `/api/auth/login/` | Log in and receive an auth token. |
| `GET` | `/api/auth/me/` | Get the logged-in user's role to display the correct dashboard. |
| `GET`, `POST` | `/api/projects/` | **(NGO)** List own projects or create a new one. |
| `POST` | `/api/projects/{id}/updates/` | **(NGO)** Add a progress update with an image to a specific project. |
| `GET` | `/api/admin/projects/` | **(Admin)** List all projects in the system for review. |
| `PATCH` | `/api/admin/projects/{id}/` | **(Admin)** Update a project's status to "Approved" or "Rejected". |

---

## 🚀 The Next Step

Once this beautiful and functional interface is complete, it will become the foundation for Phase 2: integrating a revolutionary blockchain system to tokenize these verified carbon credits. What you build today is the crucial first step toward that future.

---

## ✅ Implementation Log (AI Assist)

Tracking incremental frontend build steps.

### 2025-09-11 Phase 1 Modularization
Initial single-file prototype (`frontend/app.js`) refactored into a lightweight modular structure to enable iterative enhancement.

Created structure under `frontend/src/`:
- `api/client.js`: Centralized API wrapper with error handling & token persistence.
- `state/auth.js`: Auth state management (hydrate, login, logout).
- `components/ui.js`: Small UI helpers (templating + flash messaging).
- `views/` (`auth.js`, `ngo.js`, `admin.js`): Route-level render functions separated by domain.
- `router/index.js`: Hash-based router orchestrating view selection + event binding.
- `main.js`: Entry module bootstrapping the app.

Updated `frontend/index.html` to load the ES module entrypoint (`/frontend/src/main.js`) instead of legacy `app.js` and annotated as modular Phase 1.

Kept styling (`styles.css`) unchanged; will iterate later with accessibility improvements (focus styles, reduced motion, color contrast checks).

### Feature Coverage vs Mission Spec
- Authentication (login/register) forms: Implemented.
- Role-based dashboard routing: Implemented (NGO vs Admin).
- NGO project list + create form: Implemented.
- NGO project detail + submit update (image+notes): Implemented.
- Admin project list (all) + approve/reject actions: Implemented.
- Admin project detail + updates: Implemented.
- JWT persistence via localStorage: Implemented.
- Error feedback: Basic flash messaging (needs refinement for per-field feedback later).

### Planned Next Enhancements
1. Loading states (skeleton or spinner) for API calls.
2. Centralized error boundary + retry for transient failures (network 5xx).
3. Form validation UX (disable submit while pending, minimal inline errors).
4. Accessibility: ARIA roles for flash region + keyboard focus management post-navigation.
5. Empty states (e.g., no projects yet) with call-to-action.
6. Pagination support if backend adds it (currently expecting `results` wrapper).
7. Image preview before upload; size/type guard.
8. Basic theming (dark mode toggle) - optional stretch.

### Assumptions Noted
- Backend endpoints follow documented paths already confirmed in Django `urls.py` files.
- Project list returns either `{ results: [...] }` or raw array; code handles both.
- Auth token path uses SimpleJWT `/auth/token/` returning `{ access, refresh }` (refresh not yet used).

### Technical Debt / TODO Markers
- No service worker / offline strategy yet.
- No bundler; pure ES modules acceptable for Phase 1 simplicity.
- No unit tests for frontend logic yet (could add lightweight vitest setup if tooling introduced later).

---

End of log entry.
