# POS App

Loyiha tavsifi - Offline-first Point of Sale (POS) tizimi. Ikki rejimda ishlaydi:
- **SERVER_AND_POS**: Server va POS klient birgalikda
- **POS_ONLY**: Faqat POS klient, alohida serverga ulanadi

## Arxitektura

3-qatlamli arxitektura:

```
┌─────────────────┐
│   Renderer      │  React + TypeScript (UI qatlami)
│   (Frontend)    │
└────────┬────────┘
         │ IPC
┌────────▼────────┐
│   Preload       │  Context Bridge (xavfsiz IPC)
└────────┬────────┘
         │ IPC
┌────────▼────────┐
│   Main          │  Electron Main Process (biznes logika)
│   (Backend)     │  - Database (better-sqlite3)
│                 │  - Local Server (Express)
│                 │  - Sync Engine
└─────────────────┘
```

## Skriptlar

| Komanda | Tavsif |
|---------|--------|
| `npm run dev` | Development rejimida ishga tushirish |
| `npm run build` | Production uchun build qilish |
| `npm run preview` | Build natijasini test qilish |
| `npm run lint` | ESLint orqali kodni tekshirish |
| `npm run lint:fix` | ESLint xatolarini avtomatik tuzatish |
| `npm run typecheck` | TypeScript tip xatolarini tekshirish |

## Rejimlar

Konfiguratsiya orqali belgilanadi (`AppConfig.mode`):

- **SERVER_AND_POS**: Mahalliy server ishga tushadi va POS interfeysi ochiladi
- **POS_ONLY**: Faqat POS interfeysi, tashqi serverga ulanadi

## DB Joylashuvi

Ma'lumotlar bazasi foydalanuvchi ma'lumotlari papkasida saqlanadi:

```
<userData>/posapp.db
```

Masalan:
- Windows: `C:\Users\<user>\AppData\Roaming\posapp\posapp.db`
- macOS: `~/Library/Application Support/posapp/posapp.db`
- Linux: `~/.config/posapp/posapp.db`

Log fayllar:
```
<userData>/logs/app.log
```

## Migration Tizimi

Versioned migration tizimi ishlatiladi:

1. Har bir migration `src/main/db/migrations/` papkasida alohida fayl
2. Fayl nomi formati: `NNNN_description.ts` (masalan, `0001_initial.ts`)
3. Har bir migration eksport qiladi:
   - `version: number` - unikal versiya raqami
   - `name: string` - migration nomi
   - `up(db: Database): void` - upgrade funksiyasi

### Yangi Migration Qo'shish

1. `src/main/db/migrations/` papkasida yangi fayl yarating
2. Keyingi versiya raqamini bering (masalan, `0002_add_customers.ts`)
3. `up()` funksiyasida SQL o'zgarishlarini yozing
4. `runMigrations()` avtomatik ravishda yangi migration'ni topadi va apply qiladi

### Data Preservation

Eski versiyadan yangilanayotganda:
- Eski `schema_migrations` jadvali (id+name format) yangi formatga (version+applied_at) avtomatik konvertatsiya qilinadi
- Barcha mavjud ma'lumotlar (outbox, products) saqlanib qoladi

## IPC Kanallar

Barcha IPC kanallar `src/shared/ipcChannels.ts` faylida markazlashtirilgan:

| Kanal | Tavsif |
|-------|--------|
| `posapp:getConfig` | Joriy konfiguratsiyani olish |
| `posapp:saveConfig` | Konfiguratsiyani saqlash |
| `posapp:getHardwareSettings` | Hardware sozlamalarini olish |
| `posapp:saveHardwareSettings` | Hardware sozlamalarini saqlash |
| `posapp:getLanAddresses` | LAN IP adreslarini olish |
| `posapp:applyFirewallRule` | Firewall qoidasini qo'llash |
| `posapp:syncNow` | Sinxronizatsiyani boshlash |
| `posapp:enqueueTestOutbox` | Test outbox yozuvini qo'shish |

## Loyiha Tuzilishi

```
src/
├── main/           # Electron Main Process
│   ├── db/         # Database va migrations
│   ├── server/     # Local Express server
│   ├── sync/       # Sync engine
│   └── index.ts    # Main entry point
├── preload/        # Preload scripts (IPC bridge)
├── renderer/       # React frontend
└── shared/         # Shared types va konstantalar
```
