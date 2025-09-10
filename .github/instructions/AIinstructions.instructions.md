---
applyTo: '**'
---
# Phase 1: Core Off-Chain Application Instructions
for AI: keep track of the current state of the repository. and update this file accodingly as you do the work.

---

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

### 2.3. User Personas & Stories

- Persona 1: Neha (NGO Project Manager)
  - As Neha, I want to register an account for my NGO.
  - As Neha, I want to create a new restoration project with details like name, location (latitude/longitude), area, and a description.
  - As Neha, I want to view a dashboard of all my projects and their current status (Pending, Approved, Rejected).
  - As Neha, I want to upload periodic updates (photos, text reports) to a specific project to show our progress.

- Persona 2: Dr. Sharma (NCCR Admin/Verifier)
  - As Dr. Sharma, I need a secure login to the admin portal.
  - As Dr. Sharma, I want to see a queue of all projects submitted by NGOs that are pending verification.
  - As Dr. Sharma, I want to click on a project to view all its details and the updates submitted by the NGO.
  - As Dr. Sharma, I want to approve or reject a project with a single click.

### 2.4. Data Models (The Blueprint)

Here is the proposed Django model structure. Create these models in a new app, e.g., `backend/apps/projects/models.py`.

```python
# backend/apps/accounts/models.py (or extend the default User model)
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_ROLE_CHOICES = (
        ("NGO", "NGO/Community"),
        ("ADMIN", "NCCR Admin"),
        ("BUYER", "Corporate/Buyer"),
    )
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES)
```

```python
# backend/apps/projects/models.py
from django.db import models
from ..accounts.models import User  # Adjust import path as needed

class Project(models.Model):
    PROJECT_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=255)
    description = models.TextField()
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lon = models.DecimalField(max_digits=9, decimal_places=6)
    area_hectares = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=PROJECT_STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProjectUpdate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="updates")
    notes = models.TextField()
    image = models.ImageField(upload_to="project_updates/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update for {self.project.name} at {self.created_at.strftime('%Y-%m-%d')}"
```

---

## 3. Actionable Tasks & Execution Plan

### Step 1: Project Setup (Team Lead)

- Navigate to the `backend/` directory.
- Create a Django project: `django-admin startproject server .`
- Create an accounts app for the custom user model: `python manage.py startapp accounts apps/accounts`.
- Create a projects app for the project models: `python manage.py startapp projects apps/projects`.
- Add the new apps (`apps.accounts`, `apps.projects`) and `rest_framework` to `INSTALLED_APPS` in `server/settings.py`.
- Configure `AUTH_USER_MODEL = 'accounts.User'` in `server/settings.py`.

### Step 2: Implement Models & Admin (Backend Dev)

- Implement the `User`, `Project`, and `ProjectUpdate` models as defined above.
- Run `python manage.py makemigrations` and `python manage.py migrate`.
- Register the models in `projects/admin.py` so they are accessible in the Django admin panel for easy testing.

### Step 3: Build APIs (Backend Dev)

Using Django REST Framework, create the following API endpoints:

- Authentication:
  - `POST /api/auth/register/` - Public endpoint for user registration.
  - `POST /api/auth/login/` - Public endpoint for user login, returns an auth token.

- Projects (NGO Role):
  - `POST /api/projects/` - Create a new project. (Requires NGO authentication).
  - `GET /api/projects/` - List all projects owned by the logged-in NGO.
  - `GET /api/projects/{id}/` - View details of a specific project.

- Project Updates (NGO Role):
  - `POST /api/projects/{id}/updates/` - Add an update (with image) to a project.

- Admin Dashboard (Admin Role):
  - `GET /api/admin/projects/` - List ALL projects from ALL NGOs. (Requires Admin authentication).
  - `PATCH /api/admin/projects/{id}/` - Update a project's status (e.g., set status to "Approved").

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