---
applyTo: '**'
---
##keep suggesting the next step after every prompt response
## 🎯 Our Objective: Empowering Users Through Design

Your mission is to create a clean, intuitive, and responsive frontend experience for the two primary users who will bring this registry to life. The interface should feel supportive and focused, allowing them to perform their crucial tasks without friction.

### The User Journeys

* **Neha, the NGO Manager:** Her journey begins with registering her community's new mangrove plantation project. She'll use the dashboard you build to proudly upload photos and notes, tracking her project's progress from "Pending" to "Approved." Her work will finally have the visibility it deserves.

* **Dr. Sharma, the NCCR Verifier:** He needs an efficient and clear dashboard to review the incredible work being done by NGOs across the country. Your interface will give him a bird's-eye view of all projects, allowing him to easily access details and confidently approve their status, ensuring the integrity of the entire system.
=======

---
# Phase 1: Core Off-Chain Application Instructions
for AI: keep track of the current state of the repository. and update this file accodingly as you do the work.
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
- Public map loads under 1s on local with 200+ projects.
- Pins cluster smoothly; popups show clean info.
- Approved projects visibly distinct; “on-chain” fields display when present.

---

## 8) Future (Short Plan for Visible Blockchain)
When ready to integrate chain (Polygon Mumbai):
- Keep current APIs; just populate onchain_project_id and total_credits_minted from chain sync.
- Add optional Polygonscan links in project detail (tx_register/tx_approve) if hashes exist.
- Background sync task to update totals and tx status (idempotent).
- Admin approve flow to write on-chain, then update DB fields (deferred until after Map MVP).
- Optional: /api/public/chain/summary for totals across all projects.

Focus now: ship the Map MVP and clean public APIs. Blockchain is a drop-in enhancement later without breaking the frontend.