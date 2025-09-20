## live at: https://jitendradara12.pythonanywhere.com/landing.html
(may experience lag due to slow server)


CarbonManthan — Phase 1 (Off-chain Backend)

Quick start

1) Install dependencies
   - Python 3.10+
   - pip install -r requirements.txt

2) Configure env
   - cp backend/.env.example backend/.env (adjust as needed)

3) Migrate and run
   - python3 backend/manage.py migrate
   - python3 backend/manage.py createsuperuser  # optional, for admin
   - python3 backend/manage.py runserver

Admin

- Visit /admin/ to use Django admin. Use the superuser created above.

Auth

- Register
  curl -X POST http://127.0.0.1:8000/api/auth/register/ \
    -H 'Content-Type: application/json' \
    -d '{"username":"neha","email":"neha@example.com","password":"Password123","role":"NGO"}'

- Login (JWT)
  curl -X POST http://127.0.0.1:8000/api/auth/token/ \
    -H 'Content-Type: application/json' \
    -d '{"username":"neha","password":"Password123"}'

NGO Projects

- Create project
  curl -X POST http://127.0.0.1:8000/api/projects/ \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -H 'Content-Type: application/json' \
    -d '{"name":"Sunderbans","description":"Mangrove drive","location_lat":22.000001,"location_lon":88.000001,"area_hectares":10.5}'

- List own projects
  curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8000/api/projects/

- Get project
  curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://127.0.0.1:8000/api/projects/1/

- Create update with image
  curl -X POST http://127.0.0.1:8000/api/projects/1/updates/ \
    -H "Authorization: Bearer <ACCESS_TOKEN>" \
    -F notes='Week 1 update' \
    -F image=@/path/to/photo.jpg

Admin APIs

- List all projects
  curl -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" http://127.0.0.1:8000/api/admin/projects/

- Approve/Reject project
  curl -X PATCH http://127.0.0.1:8000/api/admin/projects/1/ \
    -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
    -H 'Content-Type: application/json' \
    -d '{"status":"Approved"}'

Notes

- Default DRF permission is IsAuthenticated; registration and JWT endpoints are public.
- CORS is permissive in dev; adjust backend/.env for production.
- Images are stored at backend/media/ and served via /media/ in DEBUG.

Testing

- With pytest:
  pytest
  pytest -q  # quiet

CI

- GitHub Actions workflow `.github/workflows/ci.yml` runs tests on push/PR to main.

Public Explorer (Map‑First MVP)

- Public API endpoints:
  - GET `/api/public/projects.geojson` — GeoJSON FeatureCollection with optional filters `status`, `bbox=minx,miny,maxx,maxy`, and `q` (name/location_text).
  - GET `/api/public/projects/{id}` — Compact JSON detail for map panel.
- Caching: 60–120s with ETag/Last-Modified; anonymous rate limit ~60 req/min.
- Explorer page (no auth): open `/explorer` or `/frontend/explorer.html` after running the server.
- Marker palette: Approved `#1B9E77`, Pending `#E6AB02`, Rejected `#D95F02`.
- India bounds: [68, 6, 97.5, 37.5].

Seed demo projects

Run this to add demo coastal projects locally:

```
python3 backend/manage.py seed_projects
```
