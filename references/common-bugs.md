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

## Page-load event tidak sesuai pengaturan Scalev

Cause: event page-load di-hardcode (misal `track("facebook", "PageView")`), bukan baca dari konfigurasi halaman Scalev.
Fix: gunakan `firePageEvents()` yang baca dari `scalev.page.events` atau `scalev.page.analyticsEvents`. Jangan hardcode provider atau event name. Kalau Scalev tidak kirim config, biarkan kosong — jangan fallback ke hardcode.
