PHASE-01: Foundation Hardening
Maqsad
Kod bazasini keyingi fazalar uchun xavfsiz qilish: versioned migrationtizimi, structured logger, markazlashtirilgan IPC kanal konstantalari,ESLint, README. Hech qanday yangi feature QO'SHILMAYDI — mavjudfunksional (SetupWizard, HomePage, SettingsPage, sync test) ishlashisaqlanishi shart.

Branch
phase-01-foundation

Yuklanadigan dependency'lar (package.json)
eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin(devDependencies)
pino (dependencies) — structured logging uchun
vitest (devDependencies) — phase-9 uchun zamin, hozir faqat o'rnatiladi

Scripts qo'shish:

"lint": "eslint src --ext .ts,.tsx"
"lint:fix": "eslint src --ext .ts,.tsx --fix"
"typecheck": "tsc --noEmit -p tsconfig.json"

Yaratiladigan fayllar
1. src/shared/ipcChannels.ts
Markazlashtirilgan IPC kanal nomlari. Kontrakt:

export const IPC = {  GET_CONFIG:        'posapp:getConfig',  SAVE_CONFIG:       'posapp:saveConfig',  GET_HARDWARE:      'posapp:getHardwareSettings',  SAVE_HARDWARE:     'posapp:saveHardwareSettings',  GET_LAN:           'posapp:getLanAddresses',  APPLY_FIREWALL:    'posapp:applyFirewallRule',  SYNC_NOW:          'posapp:syncNow',  ENQUEUE_TEST:      'posapp:enqueueTestOutbox',} as const;export type IpcChannel = (typeof IPC)[keyof typeof IPC];

Main (ipcMain.handle) va preload (ipcRenderer.invoke) FAQAT
IPC.* orqali murojaat qiladi. grep -rn "'posapp:" src/ natijasi
faqat ipcChannels.ts'da bo'lishi kerak.

2. src/main/logger.ts
Structured logger. Kontrakt:

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}
export function createLogger(opts: { userDataPath: string }): Logger;

Talablar:

pino asosida, JSON format
Fayl: <userData>/logs/app.log (phase-1 uchun rotatsiyasiz, phase-9'da
size-based rotation qo'shiladi)
Dev rejimida pino-pretty bilan console'ga ham yoziladi
Main modullari createLogger orqali instans oladi (modul global'i emas)

3. src/main/db/migrations/ (yangi papka)
src/main/db/migrations/index.ts
Migration runner. Kontrakt:

export interface Migration {
  version: number;
  name: string;
  up(db: Database.Database): void;
}
export function runMigrations(db: Database.Database): void;

Logika:

schema_migrations jadvali yangi formatda:
version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now'))
AVVAL eski schema_migrations (id+name) mavjud bo'lsa, migratsiya
qilinadi: eski jadvalni yangi formatga moslashtirish (data preservation).
Bu muhim — mavjud foydalanuvchilar DB'si buzilmasin.
SELECT MAX(version) FROM schema_migrations → applied version
migrations/ papkasidagi barcha migration'larni version bo'yicha
tartiblab, applied'dan kattalarini ketma-ket apply qilish
Har bir migration alohida transaction'da: db.transaction(() => m.up(db))()
Xatoda transaction rollback, logger orqali error, throw

src/main/db/migrations/0001_initial.ts
Hozirgi migrations.ts'dagi INIT_SQL'ni shu yerga ko'chiradi.
Version=1, name='initial'. Uchta jadval (schema_migrations'ning yangi
formati, outbox, products) shu yerda yaratiladi.

DIQQAT: schema_migrations'ning yangi version+applied_at formati
shu migration'da belgilanadi. Eski id+name formati bo'lgan DB'lar
uchun index.ts'dagi adapter logikasi mas'ul.

4. eslint.config.js (flat config)
@typescript-eslint recommended
no-unused-vars error
@typescript-eslint/no-explicit-any warn
src/ ni lint qiladi

5. README.md
Quyidagi bo'limlar:

Loyiha tavsifi (POS, offline-first, ikki rejim)
Arxitektura (3-qatlamli, ASCII diagramma)
Skriptlar (dev, build, preview, lint, typecheck)
Rejimlar (SERVER_AND_POS / POS_ONLY)
DB joylashuvi (userData/posapp.db)
Migration tizimi (versioned, qanday yangi migration qo'shiladi)
IPC kanallar ro'yxati

O'zgartiriladigan fayllar
src/main/db/database.ts
migrate(db) o'rniga runMigrations(db) chaqiriladi
import { migrate } from './migrations' → import { runMigrations } from './migrations'
src/main/db/migrations.ts
O'CHIRILADI (mazmuni migrations/0001_initial.ts'ga ko'chirildi)
src/main/index.ts
ipcMain.handle('posapp:...', ...) → ipcMain.handle(IPC.GET_CONFIG, ...)
Barcha 8 kanal shunday
Fayl boshida logger instans yaratiladi: const log = createLogger({ userDataPath: app.getPath('userData') })
Lifecycle event'lar (whenReady, window-all-closed, before-quit)
logger orqali log qilinadi
applyRuntimeFromConfig ichidagi DB ochish/server start log qilinadi
src/preload/index.ts
'posapp:...' string'lari → IPC.* konstantalari
import { IPC } from '@shared/ipcChannels'
package.json
Yangi devDeps + scripts (yuqorida ko'rsatilgan)
Migration kontrakti (data preservation)
Mavjud posapp.db bo'lgan foydalanuvchi phase-01'ga yangilaganda:
outbox qatorlari saqlanadi
products (bo'sh bo'lsa ham) jadvali saqlanadi
Eski schema_migrations (id+name) yangi formatga (version+applied_at)
moslashtiriladi: eski name='v1' → version=1, applied_at=now
Yangi o'rnatilgan foydalanuvchi: schema_migrations version=1 bilan
boshlanadi.

Acceptance Criteria
npm run dev ishga tushadi, SetupWizard → HomePage → SettingsPage
tartibi buzilmasdan ishlaydi
npm run lint — 0 error, 0 warning (no-explicit-any dan tashqari)
npm run typecheck — 0 error
grep -rn "'posapp:" src/ | grep -v ipcChannels.ts — 0 natija
Mavjud posapp.db bilan yangilanganda outbox ma'lumotlari saqlanadi
(qo'lda test: DB'ga test outbox qo'sh, phase-01'ga yangila, tekshir)
<userData>/logs/app.log fayli yaratiladi, lifecycle event'lar yoziladi
schema_migrations da version va applied_at ustunlari mavjud
README.md mavjud va yuqoridagi bo'limlarni o'z ichiga oladi
Hech qanday yangi feature (product CRUD, savdo va h.k.) QO'SHILMAGAN
Diff scope (kutilgan)
Yangi fayllar: ~7 (ipcChannels, logger, migrations/index, migrations/0001, eslint.config, README, + package.json o'zgarish)
O'zgartirilgan: ~4 (database, index, preload, package.json)
O'chirilgan: 1 (migrations.ts)
Net: ~200-280 qator
Taqiqlar (phase-1 uchun)
Product CRUD yo'q
Inventar yo'q
Savdo yo'q
Sync logic o'zgartirilmaydi (faqat logger qo'shiladi)
Hardware integratsiya yo'q
CSP/TLS yo'q (phase-9)
Testlar yo'q (phase-9, faqat vitest o'rnatiladi)