---
applyTo: '**'
---
#keep suggesting the next step after every prompt response
## 🎯 Our Objective: Empowering Users Through Design

Your mission is to create a clean, intuitive, and responsive frontend experience for the two primary users who will bring this registry to life. The interface should feel supportive and focused, allowing them to perform their crucial tasks without friction.

### The User Journeys

* **Neha, the NGO Manager:** Her journey begins with registering her community's new mangrove plantation project. She'll use the dashboard you build to proudly upload photos and notes, tracking her project's progress from "Pending" to "Approved." Her work will finally have the visibility it deserves.

* **Dr. Sharma, the NCCR Verifier:** He needs an efficient and clear dashboard to review the incredible work being done by NGOs across the country. Your interface will give him a bird's-eye view of all projects, allowing him to easily access details and confidently approve their status, ensuring the integrity of the entire system.
=======

---
# Phase 1: Core Off-Chain Application Instructions
for AI: keep track of the current state of the repository. and update this file accodingly as you do the work.



Changelog (AI updates):

- [2025-09-10] Step 1 setup started and wiring done:
  - Added DRF and local apps to INSTALLED_APPS in `backend/server/settings.py`.
  - Set `AUTH_USER_MODEL = 'accounts.User'`.
  - Created custom `User` model with role field in `backend/apps/accounts/models.py`.
  - Fixed app configs to use `apps.accounts` and `apps.projects`.
  - Added `backend/apps/__init__.py` to register the package.
  - Next: create `projects` models, register admin, and run migrations.
\n+- [2025-09-10] Step 2 models and admin complete:
  - Implemented `Project` and `ProjectUpdate` models in `backend/apps/projects/models.py`.
  - Registered models in `backend/apps/projects/admin.py` and custom `User` in `backend/apps/accounts/admin.py`.
  - Added `MEDIA_URL` and `MEDIA_ROOT` in settings and wired media URLs in `server/urls.py`.
  - Ran `makemigrations` and `migrate` successfully.
  - Next: Build DRF APIs for auth, projects, and updates.

- [2025-09-10] Step 3 APIs and config implemented:
  - Added dependencies: Pillow, Simple JWT, and django-cors-headers in `requirements.txt` and installed them.
  - Configured `REST_FRAMEWORK` with JWT auth, default permissions, pagination; added CORS middleware; wired environs for `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`.
  - Accounts: `RegisterView` and URLs for `/api/auth/register/`, JWT token and refresh endpoints.
  - Projects (NGO):
    - `POST /api/projects/` create project (NGO only)
    - `GET /api/projects/` list own projects (NGO only)
    - `GET /api/projects/{id}/` retrieve own project (NGO only)
    - `POST /api/projects/{id}/updates/` create update with image (multipart, NGO only)
  - Admin:
    - `GET /api/admin/projects/` list all projects
    - `PATCH /api/admin/projects/{id}/` update status only
  - Added validations: lat/lon ranges, positive area; added DB indexes and unique constraint `(owner, name)`.

- [2025-09-10] Docs and setup polish:
  - Added `backend/.env.example` for env configuration.
  - Created `README.md` with setup and curl examples.
  - Created default superuser `admin` (admin@example.com) for testing.

- [2025-09-10] Step 4 minimal frontend wired:
  - Added simple static frontend under `frontend/` (index.html, styles.css, app.js).
  - Hosted via Django dev server at `/` -> `/frontend/index.html`.
  - Views:
    - Login and Register
    - NGO dashboard (list/create projects), project detail with upload & updates list
    - Admin dashboard (list, detail, approve/reject, updates list)
  - Added `/api/auth/me/` endpoint for role-aware UI.
  - Added missing read endpoints: NGO `GET /api/projects/{id}/updates/list/`; Admin `GET /api/admin/projects/{id}/` and `/api/admin/projects/{id}/updates/`.

## Project: Blockchain-Based Blue Carbon Registry (Code: CarbonManthan)

Objective for this Phase: Build a functional web application that manages users, projects, and data uploads. This is the "off-chain" foundation before we integrate any blockchain components.

---

## 1. Do What? (The Mission)

The goal of Phase 1 is to build the central hub for our system. By the end of this phase, we will have a working Django application where different types of users can register, log in, and perform their core functions.

### Core Features to Implement

- Multi-Role User Authentication:
  - Users can register as one of three types: NGO/Community, NCCR Admin, or Corporate/Buyer.
  - Users can log in and log out.
  - Access to different features will be restricted based on user role.

- Project Lifecycle Management:
  - An authenticated NGO/Community user can create a new blue carbon restoration project (e.g., "Sunderbans Mangrove Plantation Drive").
  - They can view their created projects and upload data/updates to them (e.g., photos, text reports).
  - An NCCR Admin user can view a list of all submitted projects.
  - The admin can review a project's details and its updates.
  - The admin has buttons to "Approve" or "Reject" a project. (Note: In this phase, this button will only change the project's status in our database. The blockchain logic comes later.)

### Visual Workflow

This diagram shows the basic interaction: NGOs create projects, admins review them, and all the data is stored in our database.

---

## 2. Technologies & Context (For Developers & AI Agents)

This section provides the necessary context for any developer or AI agent to understand the project's architecture and make informed implementation decisions.

### 2.1. Technology Stack

- Backend Framework: Python 3.10+ with Django 4.x
- API Framework: Django REST Framework (DRF) for building RESTful APIs.
- Database: SQLite (default for Django, sufficient for hackathon).
- Authentication: Django's built-in User model, extended for roles. Token-based authentication (e.g., DRF's TokenAuthentication or Simple JWT).
- File Handling: Django's FileField or ImageField for uploads.

### 2.2. Project Context

- Problem Domain: We are creating a digital Monitoring, Reporting, and Verification (MRV) system for blue carbon projects. The system must be trustworthy and transparent.
- Phase 1 Scope: This phase is entirely "off-chain." We are building a standard CRUD (Create, Read, Update, Delete) application. No blockchain interaction is required yet. The focus is on building robust APIs and a clear data structure.
- Repo Structure: All backend code should reside in the `backend/` directory. Create new Django apps inside the `backend/apps/` folder as needed (e.g., accounts, projects).

## 3. Actionable Tasks & Execution Plan

### Step 1,2,3 done. 
### Step 4: Build Frontend Views (Frontend Dev)

- Login/Register Page: A simple form for users to sign up and log in.
- NGO Dashboard:
  - Displays a list of the user's projects.
  - A button to "Create New Project" which opens a form.
  - Clicking a project goes to its detail page.
- Project Detail Page:
  - Shows project info (name, location, etc.).
  - Lists all ProjectUpdates with their images and notes.
  - Contains a form to submit a new update.
- Admin Dashboard:
  - Displays a table of all projects in the system with their current status.
  - Each row should have "View", "Approve", and "Reject" buttons.

---

## 4. Next Steps

Once Phase 1 is complete and functional, we will move to Phase 2, which involves designing the smart contract. This solid off-chain application will make the blockchain integration in later phases much smoother.
