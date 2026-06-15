# AGENTS.md
**AI Instructions — Scalev HTML Mode Skill**

> [!IMPORTANT]
> **Mandatory Reading Before Any Task:**
> 1. [SKILL.md](./SKILL.md) — Core rules, workflow, payload patterns, redirect logic
> 2. [references/runtime-data.md](./references/runtime-data.md) — Scalev data shapes
> 3. [references/checkout-patterns.md](./references/checkout-patterns.md) — Checkout payload + digital product patterns
> 4. [references/after-checkout.md](./references/after-checkout.md) — Redirect behavior
> 5. [references/common-bugs.md](./references/common-bugs.md) — Known bugs and fixes

---

## 1. Project Overview

Scalev HTML Mode Skill — skill project untuk Codex agent yang membangun, debug, dan review halaman HTML kustom Scalev (landing page, checkout page, thank-you page). Bukan aplikasi runtime. Output berupa file HTML yang di-import ke Scalev dashboard.

**Jenis halaman yang dihasilkan:**
- Landing page produk digital
- Checkout page produk digital (dengan/tanpa order bump)
- Checkout page bundle pricing
- Thank-you / after-checkout page

**Repo structure:**
```
.
├── SKILL.md              # Main skill definition
├── AGENTS.md             # AI instructions (this file)
├── README.md             # Human-facing readme
├── EXAMPLES.md           # Example prompts
├── LICENSE
├── assets/templates/     # Starter HTML templates
├── references/           # Skill reference docs
├── scripts/              # Validation scripts
└── agents/               # Agent configs
```

---

## 2. Code Quality Standards

### HTML/CSS
- Mobile-first, satu file HTML dengan inline `<style>` dan `<script>`
- Tidak pakai framework JS eksternal (React, Vue, dll) — vanilla JS only
- CSS pakai custom properties (`--color-*`) untuk theming
- Gunakan font dari Google Fonts CDN
- Radius, shadow, spacing konsisten antar section

### JavaScript
- Gunakan `window.Scalev` runtime saja — jangan panggil private Scalev API endpoint langsung
- Baca data dari `Scalev.data.get()` sekali di awal script
- Harga utama dari `product.variants[0].price`, bukan `product.price`
- Payment methods dari `store.paymentMethodOptions`, jangan hardcode
- Redirect ikut `afterCheckout.type` dari dashboard, jangan force type tertentu
- Order bump dari `store.products[1]` + `store.bundlePriceOptions[1]`, jangan hardcode
- Pixel/analytics: biarkan Scalev inject server-side. Pastikan ada delay sebelum redirect (lihat section 5)

### Never Do
- Jangan hardcode pixel ID, event name, atau tracking code
- Jangan panggil `https://api.scalev.com/v2/catalog/{host}/cart` dari HTML
- Jangan submit bundle-priced item sebagai `type: "product"`
- Jangan pakai `estimateSummary()` untuk digital checkout
- Jangan hardcode payment method list
- Jangan hardcode product name, price, image, atau description

---

## 3. Task Execution Rules

### Before Starting Any Task
1. Baca SKILL.md + reference yang relevan
2. Tentukan tipe halaman: landing, checkout, thank-you, atau debug
3. Pilih template starter yang sesuai dari `assets/templates/`
4. Jelaskan rencana di chat sebelum mulai edit

### While Working
- Edit file HTML langsung — jangan generate file baru kecuali diminta
- Adaptasi copy, styling, dan section ke konteks user, tapi jaga Scalev runtime access, checkout payload, dan redirect logic tetap sesuai SKILL.md
- Kalau user minta halaman baru, mulai dari template yang ada

### After Completing
1. Jalankan `node scripts/check-html-js.mjs <file.html>` untuk validasi syntax
2. Pastikan semua rule SKILL.md terpenuhi:
   - Harga dari `variants[0].price`
   - Payment method dari `store.paymentMethodOptions`
   - Redirect ikut `afterCheckout`
   - Order bump dinamis (bukan hardcode)
   - Pixel delay ada di `navigateAfterOrder` / `navigate`
3. Ringkas apa yang diubah dan kenapa

---

## 4. Template Modification Rules

### checkout-digital-template.html
- Template utama untuk checkout digital dengan order bump
- Config di `CHECKOUT_TEMPLATE_CONFIG` — tambah config baru di sini, jangan hardcode
- `pixelDelayMs` wajib ada (default 600)
- `navigateAfterOrder()` wajib pakai `setTimeout` dengan `pixelDelayMs`
- Order bump render hanya kalau `store.products[1]` + `store.bundlePriceOptions[1]` ada

### checkout-digital.html
- Template sederhana tanpa order bump
- `var pixelDelayMs = 600` wajib ada
- `navigate()` wajib pakai `setTimeout` dengan `pixelDelayMs`

### landing-digital-template.html
- Tidak ada checkout/redirect — tidak perlu pixel delay
- Config di `DIGITAL_PRODUCT_CONFIG`
- Semua copy, harga, CTA link dari config object

---

## 5. Pixel / Analytics Rules

- Scalev inject Meta Pixel dan analytics script server-side. Custom HTML harus beri waktu event fire sebelum redirect
- Setiap redirect setelah `createOrder()` **wajib** pakai delay (`pixelDelayMs`, default 600ms) via `setTimeout`
- Tanpa delay, Meta Pixel event (PageView, Purchase, dll) tidak sempat fire sebelum halaman pindah
- Delay berlaku untuk SEMUA redirect type: `success_page`, `direct_to_whatsapp`, `custom_url`, dll
- `Scalev.data.get()` saat ini tidak expose pengaturan event halaman dari dashboard. Jangan asumsi ada `page.events`, `analyticsEvents`, atau field sejenis
- Kalau user eksplisit minta Pixel ID dan event tertentu (contoh: page open = `AddToCart`), boleh hardcode event + Pixel ID itu di custom HTML
- Untuk event Meta Pixel eksplisit, pakai `fbq("trackSingle", pixelId, eventName, params)` agar event masuk ke Pixel ID target tanpa init ulang base pixel Scalev
- Jangan panggil ulang `fbq("init", pixelId)` kalau Scalev sudah menyediakan `fbq`; re-init bisa bentrok dan event hilang
- Jangan trigger `PageView` manual kecuali user eksplisit minta. Scalev/Meta base script bisa sudah mengirim PageView
- `Scalev.analytics.track(provider, payload)` wajib pakai format resmi: `events: [{ eventName, parameters }]` dengan camelCase. Jangan kirim top-level `event` atau snake_case `event_name`

---

## 6. Validation Workflow

Setiap selesai edit file HTML:
```bash
node scripts/check-html-js.mjs path/to/file.html
```

Script ini cek syntax error di inline `<script>` block. Tidak verifikasi Scalev runtime data, payment behavior, atau dashboard config.

Kalau semua script OK:
```
file.html: script 1 OK
```

Kalau ada error, fix dulu sebelum lanjut.

---

## 7. Reference Files

Load sesuai kebutuhan, jangan semua sekaligus:

| File | Kapan dipakai |
|---|---|
| `references/runtime-data.md` | Butuh shape data Scalev, image helper, price pattern |
| `references/checkout-patterns.md` | Butuh checkout payload, bundle item, order bump pattern |
| `references/after-checkout.md` | Butuh redirect type mapping |
| `references/landing-patterns.md` | Bikin/ubah landing page |
| `references/common-bugs.md` | Debug issue yang sudah dikenal |

---

## 8. Communication Style

- Terse caveman mode: drop articles, filler words, use fragments
- Technical terms, code, file paths, errors: keep exact
- Security warnings: use normal mode
- Setelah selesai task: ringkas singkat, sebut file yang diubah

---

## 9. Git Workflow

### Branch Naming
- `codex/deskripsi-singkat`

### Commit Messages
```
feat: add pixel delay to checkout templates
fix: order bump charges wrong amount
docs: update pixel tracking in common-bugs
```

### Rules
- Jangan commit tanpa diminta user
- Jangan push tanpa diminta user
- Jangan buat branch baru tanpa diminta user
- Sebelum commit: pastikan `node scripts/check-html-js.mjs` semua file HTML yang diubah lolos

---

**Last updated:** 2026-06-14
