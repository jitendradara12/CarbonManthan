Frontend refactor in progress: migrating from single-file app.js to modular structure.

Planned folders:
- api/: fetch wrappers
- components/: reusable UI pieces
- views/: route-level views
- state/: auth and global store
- router/: hash router logic

Build: still plain ES modules (no bundler) for simplicity in Phase 1.
