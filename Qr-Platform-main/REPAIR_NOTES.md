# Repair pass notes (2026-11-24)

- Added backend QR payload checks for HTTP(S) URLs, required Wi-Fi SSID, email recipient, WhatsApp phone and geographic coordinate bounds.
- Added QR creation checks for supported mode, 6-digit hex colors, output size range (128–1024), and multi-link URL/label/count requirements.
- Added an upload MIME allowlist and upload size limit remains configurable.
- Updated payload validation on QR edits.

## Verification
- `node --check backend/src/routes/qr.js`: passed.
- `node --check backend/src/server.js`: passed.
- `npm test`: unavailable; backend package has no test script.
- Runtime/integration testing not yet performed.

## Remaining risks / next work
- MIME allowlist alone is not content-signature verification; uploads need file magic-byte inspection and safer storage.
- Environment secrets, CORS policy, upload path, and JWT-secret startup checks need deployment hardening.
- Static QR generation, authentication, frontend builds, redirect behavior, analytics, and SQLite migration behavior still require end-to-end tests.
