PosApp — Development Roadmap
Hozirgi holat (phase-0, main branch)
Electron-vite 3-qatlamli skelet: main / preload / renderer
React 19 + react-router-dom 7 (HashRouter)
better-sqlite3 + WAL, naiv migration (faqat v1 marker)
Express local server (STUB: /api/health, /api/sync/push, /api/sync/pull)
Outbox pattern (faqat manual flush)
3 jadval: schema_migrations, outbox, products (products — o'lik sxema)
8 IPC kanal
Hardware tiplari (printer/skaner/tarozi) aniqlangan, integratsiya yo'q
Testlar, lint, logger, CSP, README — yo'q

Maqsad (yakuniy)
Offline-first desktop POS: bitta mashinada to'liq ishlaydigan savdo,ko'p mashinalarda LAN orqali sinxron, printer/skaner/tarozi integratsiyasi,ishlab chiqarish (production) darajasida xavfsiz.

Fazalar
Foundation hardening — versioned migration, logger, IPC constants, ESLint, README
Product CRUD — mahsulot + kategoriya
Inventar (kirim/chiqim) — stock movement + balance
Savdo (transaction) — savat, to'lov, chek, stock decrement
Real sync engine — server persist, pull, secret pairing
Multi-machine sync — conflict resolution, background, retry/backoff
Hardware: printer — ESC/POS chek
Hardware: skaner + tarozi — barcode + vazn
Security + test + release — CSP, TLS, vitest, CI, electron-builder

Branch va commit qoidalari
Branch: phase-NN-<qisqa-nom> (masalan, phase-01-foundation)
Commit: phase-NN: <tavsif> (masalan, phase-01: versioned migration + logger)
Har fazadan keyin PR main'ga (review'dan keyin merge)
Hech qanday feature faza chegarasidan tashqarida bo'lmasin

Review protokoli (har fazadan keyin)
git diff main..phase-NN — fayl strukturasi
Migration data yo'qotishisiz
IPC kanallar markazlashtirilgan
Acceptance criteria bajarilgan
Yangi code smell / SOLID buzilish yo'q
Keyingi faza spec yoziladi