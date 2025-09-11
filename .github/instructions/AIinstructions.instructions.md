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
