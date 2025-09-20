---
applyTo: '**'
---
##keep suggesting the next step after every prompt response
## 🎯 Our Objective: Empowering Users Through Design

##the hackathon is near!!!, so focus on ui over ux because the judges will see the ui only

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

- [2025-09-12] Step 5 UI Polish Pass 1:
  - Added professional-looking animations and hover effects in `styles.css`.
  - Created a centralized `icons.js` component for SVG icons.
  - Redesigned `auth.js` views with a cleaner, centered layout and integrated icons into buttons.
  - Integrated icons into all buttons in `admin.js` and `ngo.js` views for a consistent look and feel.
  - Added a fade-in animation to all view transitions in `router/index.js`.
  - Next: Further UI refinements, potentially adding charts or more visual elements.

- [2025-09-12] Step 5.1 admin UX tweak:
  - Added a Quick Approve button in Admin project detail that sets status=Approved and auto-mints 100 credits (dry-run) to showcase the full flow during demos.

- [2025-09-12] Step 5.2 frontend cleanup:
  - Resolved merge conflict markers in `frontend/src/views/admin.js` and consolidated the Token Actions card.
  - De-duplicated admin and buyer button bindings in `frontend/src/router/index.js`; added inline mint result area.

- [2025-09-12] Phase 2 Explorer polish and landing map:
  - Explorer: bigger status markers, legend counts, loading overlay, and quick status chips; default shows all projects.
  - Landing: embedded mini public map with counters and a link to Polygonscan (Mumbai).
  - Public project detail now exposes `supply` { remaining, purchased, minted }.
  - Buyer purchases now enforce a simple supply cap (returns 409 with available value).
  - Seed command enhanced: adds cover images, varied statuses, and some minted credits for Approved to demo supply.
  - Explorer side panel: Added a right-hand details panel with images and supply info; popup includes a Details button to open it.
  - GeoJSON properties now include `supply_remaining`; Explorer popups show it instantly without an extra request.

- [2025-09-12] Buyer UX improvement:
  - Replaced raw Project ID input with a dropdown of Approved projects populated from the public GeoJSON, showing Remaining supply next to the selector.

## Project: Blockchain-Based Blue Carbon Registry (Code: CarbonManthan)

Objective for this Phase: Build a functional web application that manages users, projects, and data uploads. This is the "off-chain" foundation before we integrate any blockchain components.

---
# Phase 2 (Map‑First): Public Explorer with Visible Project Status

This file gives backend devs just enough context and an actionable plan to power a great-looking public map of India that shows all projects, with popups and basic “visible blockchain” fields (stubbed or real when available). Keep it simple and fast.

---

## 1) Current State (Phase 1 snapshot)
- Django + DRF with multi‑role users (NGO, NCCR, Corporate).
- NGOs create projects and upload updates; NCCR can Approve/Reject (DB only).
- Minimal dashboards exist.
- No on-chain integration required yet.

---

## 2) Goal of Phase 2 (Map‑First)
Primary: A polished public Explorer page with a map of India showing:
- Pins for all projects (clustered), colored by status (Pending/Approved/Rejected).
- Popups with key info: name, location text, area, latest update thumbnail, status.
- Basic “visible blockchain” fields in the popup (e.g., project_id_onchain, total_minted, tx links) if present; otherwise show “Not on-chain yet”.

Deliver this by providing small, cacheable public APIs and modest model tweaks. Full blockchain comes later.

---

## 3) Minimal Data Model Deltas
Add the following if not present (keep it lean):
- Project
  - latitude: Decimal(9,6)
  - longitude: Decimal(9,6)
  - location_text: CharField (city/district/state)
  - area_hectares: Decimal(10,2), null=True
  - cover_image_url: URL/Text, null=True (use latest update image if absent)
  - onchain_project_id: BigInteger, null=True (for visible blockchain field)
  - total_credits_minted: BigInteger, default=0 (aggregate; update when chain arrives)
- (Optional) TokenMint (if already created for future chain): keep but not required for Map MVP.

Seed: Add 10–20 demo projects across India’s coastline (Mumbai, Goa, Kochi, Chennai, Vizag, Sundarbans, Andamans, Kutch, etc.) with lat/lon and images.

---

## 4) Public API (Map & Explorer)
Keep responses small and cacheable; prefer GET, no auth, CORS allow-list for GET.

- GET /api/public/projects.geojson
  - Returns a GeoJSON FeatureCollection of projects.
  - Supports query params:
    - status=[Approved|Pending|Rejected]
    - bbox=minx,miny,maxx,maxy (lon/lat)
    - q=free text (name/location_text)
  - Feature properties (strict set):
    - id, name, status, location_text, area_hectares
    - cover_image_url
    - onchain_project_id (nullable)
    - total_credits_minted (int, 0 if none)
    - updated_at (ISO 8601)
  - Caching: 60–120s, ETag/Last-Modified.

Example (single feature):
{
  "type":"Feature",
  "geometry":{"type":"Point","coordinates":[72.8777,19.0760]},
  "properties":{
    "id":12,
    "name":"Mumbai Mangrove Restoration",
    "status":"Approved",
    "location_text":"Mumbai, Maharashtra, IN",
    "area_hectares":42.5,
    "cover_image_url":"https://…/mumbai.jpg",
    "onchain_project_id":1012,
    "total_credits_minted":50000,
    "updated_at":"2025-09-11T18:00:00Z"
  }
}

- GET /api/public/projects/{id}
  - Compact JSON for a project detail panel (no heavy joins):
    - id, name, description (short), status, location_text, area_hectares
    - coordinates: {lat, lon}
    - images: [urls…] (limit 5)
    - latest_updates: [{title, image_url, created_at}] (limit 3)
    - chain: {onchain_project_id, total_credits_minted, tx_register, tx_approve} (values may be null)
  - Caching: 60–120s.

Notes:
- Do not paginate GeoJSON; use bbox + status filters instead.
- Keep each feature’s properties under ~1–2 KB.

---

## 5) Frontend Contract (so it looks great)
- Map: Use Leaflet.js with OSM tiles; initial view fit to India bounds (approx bbox: [68, 6, 97.5, 37.5]).
- Client-side clustering via Leaflet.markercluster or Supercluster (no server clustering needed).
- Marker color palette:
  - Approved: #1B9E77 (green), Pending: #E6AB02 (amber), Rejected: #D95F02 (orange/red).
- Popup content from Feature properties; link to /api/public/projects/{id} for panel.
- Show “On-chain: Not yet” if onchain_project_id is null.

---

## 6) Performance & Ops
- DB indexes: Project(status), Project(latitude, longitude).
- Add simple text index on name/location_text if using PostgreSQL; otherwise LIKE fallback.
- CDN cache headers for public endpoints; ETag enabled.
- Rate limit: 60 req/min per IP for /api/public/*.

---

## 7) What to Build Now (Checklist)
- [x] Add/verify Project fields (lat, lon, location_text, area, cover_image_url, onchain_project_id, total_credits_minted).
- [x] Seed demo coastal projects with real-looking data.
- [x] Implement /api/public/projects.geojson with filters, caching, CORS.
- [x] Implement /api/public/projects/{id} detail with lightweight fields.
- [x] Add unit tests for GeoJSON shape and filters; add a Postman collection.
- [x] Hand off endpoint contract + sample JSON to frontend (Leaflet-based Explorer at /explorer).

Definition of Done:
- Public map loads under 1s on local with 200+ projects.display
- Pins cluster smoothly; popups show clean info.
- Approved projects visibly distinct; “on-chain” fields  when present.

---

## 8) Future (Short Plan for Visible Blockchain)
When ready to integrate chain (Polygon Mumbai):
- Keep current APIs; just populate onchain_project_id and total_credits_minted from chain sync.
- Add optional Polygonscan links in project detail (tx_register/tx_approve) if hashes exist.
- Background sync task to update totals and tx status (idempotent).
- Admin approve flow to write on-chain, then update DB fields (deferred until after Map MVP).
- Optional: /api/public/chain/summary for totals across all projects.

Focus now: ship the Map MVP and clean public APIs. Blockchain is a drop-in enhancement later without breaking the frontend.