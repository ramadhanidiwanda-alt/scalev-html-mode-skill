# Common Bugs

## Gross revenue 0

Cause: using `product.uniqueId` where `variantUniqueId` is required.
Fix: use `store.products[0].variants[0].uniqueId` for normal product item.

## Normal price shows 0

Cause: reading `product.price`.
Fix: read `store.products[0].variants[0].price`.

## QRIS/payment page shows wrong amount

Cause: bundle promo submitted as `type: "product"` with `bundlePriceOptionUniqueId` attached.
Fix: submit bundle as `type: "bundle"` and include only `bundlePriceOptionUniqueId` plus `quantity`.

## Order bump charges normal price

Cause: order bump product uses Scalev bundle pricing, but checkout submits it as `type: "product"` with `variantUniqueId`.
Fix: when bump maps to `store.bundlePriceOptions[1]`, submit bump as `type: "bundle"` with `bundlePriceOptionUniqueId: store.bundlePriceOptions[1].uniqueId`.

## Summary does not appear after payment method selected

Cause: `estimateSummary()` returns 400 because digital checkout lacks destination/shipping fields.
Fix: render summary client-side for digital products.

## Redirect ignores Scalev dashboard

Cause: custom logic forces payment methods to `success_page`.
Fix: use `afterCheckout.type` from `Scalev.data.get()`.

## Cart endpoint 404 on payment page

Observation: `https://api.scalev.com/v2/catalog/{host}/cart` can return `Store not found` on Scalev payment page. Do not call this endpoint from custom HTML. If it appears after successful order creation, treat as Scalev/payment-page behavior first, not checkout HTML payload error.

## Order bump image does not show

Cause: Scalev product image can be `images: ["https://..."]`, not only `images[0].url`.
Fix: support `typeof product.images[0] === "string"` in image helper.

## Order bump image cropped on mobile

Cause: mobile CSS uses fixed height or small `max-height` with object-fit behavior.
Fix: stack image above copy and use `width: 100%; height: auto; max-height: none; object-fit: contain;`.

## Meta Pixel tidak membaca event setelah checkout

Cause: redirect langsung (`window.location.assign`) setelah `createOrder()` tanpa delay. Scalev inject Meta Pixel server-side, tapi script pixel tidak sempat fire karena halaman langsung pindah.
Fix: tambahkan `pixelDelayMs` (default 600ms) sebelum redirect. Gunakan `setTimeout` di dalam `navigateAfterOrder` / `navigate`. Jangan hardcode pixel ID atau event — biarkan Scalev yang inject.

## Meta Pixel event Purchase tidak muncul

Cause: sama seperti di atas — redirect terlalu cepat.
Fix: pastikan `navigateAfterOrder` pakai `setTimeout` dengan `pixelDelayMs`. Delay berlaku untuk semua redirect type: `success_page`, `direct_to_whatsapp`, `custom_url`, dll.

## Meta Pixel event Purchase dobel

Cause: custom checkout HTML mengirim `Purchase` setelah `createOrder()`, lalu Scalev payment/success flow atau dashboard analytics juga mengirim `Purchase` untuk order yang sama. Tanpa `event_id` dedup yang sama, Meta menghitungnya sebagai dua purchase.
Fix: pilih satu conversion point. Untuk HTML Mode yang redirect ke payment/success Scalev, hapus manual `track("facebook", "Purchase")`, `PlaceOrder`, atau event purchase sejenis dari callback sukses `createOrder()`. Biarkan payment/success flow menangani purchase, atau jika user eksplisit minta purchase di order-created, pastikan flow lain tidak mengirim purchase lagi.

## Page-load event tidak sesuai kebutuhan user

Cause: custom HTML menembak event default seperti `PageView`, atau mencoba membaca pengaturan dashboard dari `Scalev.data.get()` padahal runtime tidak mengekspos setting event halaman.
Fix: jika user eksplisit memberi Pixel ID dan event (misal `AddToCart` saat halaman terbuka), tembak event tersebut langsung dengan `fbq("trackSingle", pixelId, eventName, params)`. Jangan trigger `PageView` manual kecuali diminta.

## Scalev.analytics.track tidak mengirim event dashboard

Cause: payload analytics salah, misalnya `{ event: "AddToCart" }`. Dokumentasi resmi Scalev mensyaratkan payload camelCase dengan `events: [{ eventName, parameters }]`.
Fix: panggil `Scalev.analytics.track(provider, { variants, bundlePriceOptions, events: [{ eventName: eventName, parameters: { value, currency: "IDR" } }] })`. Jangan gunakan top-level `event` / `event_name`.

## Page-load analytics silent fail

Cause: `track()` memakai helper DOM seperti `$()` sebelum helper tersebut didefinisikan. Karena error dibungkus `try/catch`, event gagal tanpa pesan error.
Fix: di fungsi analytics yang bisa dipanggil saat init awal, gunakan `document.getElementById(...)` langsung atau definisikan `$` sebelum fungsi analytics dipanggil.

## Dashboard event tidak bisa diikuti dari HTML runtime

Observation: `Scalev.data.get()` may only expose `page`, `store`, and `afterCheckout`. It does not necessarily expose dashboard page-event settings.
Fix: if the user explicitly asks for a specific Meta Pixel ID and event, hardcode that event in HTML with `fbq("trackSingle", pixelId, eventName, params)`. Do not call `fbq("init", pixelId)` again if Scalev already injects `fbq`.

## Meta Pixel event hilang setelah fbq init ulang

Cause: custom HTML calls `fbq("init", pixelId)` even though Scalev already injected Meta Pixel base code. Re-initializing can conflict with Scalev's pixel setup.
Fix: when `window.fbq` already exists, do not init again. Send explicit events with `fbq("trackSingle", pixelId, eventName, params)`.

## Page-load Meta Pixel event tidak muncul (fbq belum siap)

Cause: Scalev inject `fbq` secara async (server-side). Custom HTML `<script>` bisa jalan duluan sebelum `window.fbq` tersedia. Guard `typeof window.fbq !== "function"` langsung return tanpa retry → event drop.
Fix: gunakan polling/retry untuk page-load event. Contoh:
```js
function ensurePixelAndTrack(eventName, params, attempt) {
  attempt = attempt || 0;
  if (typeof window.fbq === "function") {
    window.fbq("trackSingle", pixelId, eventName, params);
    return;
  }
  if (attempt < 20) {
    setTimeout(function () { ensurePixelAndTrack(eventName, params, attempt + 1); }, 250);
  }
}
```
Event setelah interaksi user (submit, klik) tidak perlu retry karena `fbq` pasti sudah siap.

## Server relay Scalev analytics tidak diperlukan

Observation: custom HTML mengirim event ke `https://api.scalev.com/v3/stores/{store_id}/public/analytics/meta/events` bersamaan dengan browser Pixel. Ini bisa bikin event dobel di Meta Ads Manager kalau dedup tidak sempurna, dan menambah kompleksitas tanpa manfaat jelas.
Fix: andalkan browser Pixel (`fbq("trackSingle", ...)`) saja. Hapus `fetch()` ke endpoint analytics Scalev, `eventIdFor()`, dan `cookieValue()` untuk fbp/fbc dari custom HTML.

## Judul halaman masih default Scalev

Cause: template masih memakai title generik seperti `Scalev HTML Mode Page`, `Checkout`, atau `Landing Produk Digital`, dan belum punya meta description / Open Graph.
Fix: ganti title dan meta sesuai produk sebelum import ke Scalev. Landing page pakai `robots` `index, follow`; checkout page pakai `robots` `noindex, nofollow` agar halaman checkout tidak masuk hasil pencarian.

## Checkout blank even though script syntax is OK

Cause: HTML render targets use `data-*` attributes such as `data-product-content`, but JS looks up IDs such as `$("product-content")`. `check-html-js.mjs` syntax validation can pass because the JavaScript is valid, but runtime render fails when `document.getElementById(...)` returns null.

Fix: match the DOM contract exactly. If JS calls `$("product-content")`, HTML must contain `id="product-content"`. Same for `payment-content`, `summary-content`, and `order-bump` / `order-bump-content`. Run `node scripts/check-html-js.mjs <file.html>` after editing; the validator checks common checkout DOM target mismatches.

## Checkout looks empty when opened as a local file

Cause: Scalev runtime is only available inside Scalev HTML Mode. Opening the file directly means `window.Scalev.data.get()` is unavailable, so `store.products`, `store.bundlePriceOptions`, and `store.paymentMethodOptions` are missing.

Fix: import into Scalev to test real data. For local visual QA, use demo mode only when `store` is missing, show a visible demo banner, and never override real Scalev runtime data.

## Coupon button overflows or looks broken on desktop

Cause: coupon button reuses a global submit button class with `width: 100%`, `margin-top`, or large padding, then sits inside a horizontal flex row.

Fix: add a specific coupon class and selector, e.g. `.discount-row .discount-btn { width: auto; flex: 0 0 auto; }`, and stack the row only on small screens. Also set `.discount-row .input { min-width: 0; }`.

## Checkout cards touch each other on mobile

Cause: the card wrapper (often `.left-col`) gets `display: grid; gap: ...` only inside a desktop media query. On mobile, cards become normal block elements with no explicit gap.

Fix: define the card column gap as a base rule, e.g. `.left-col { display: grid; gap: 16px; }`, then only change column layout at larger breakpoints.

## Payment method or summary text overflows

Cause: flex children containing long payment labels or product names lack `min-width: 0`, so text refuses to shrink and can overflow the card.

Fix: add `min-width: 0` and `overflow-wrap: anywhere` to text children such as `.payment-name` and `.summary-row span:first-child`. Keep prices with `flex: 0 0 auto`.
