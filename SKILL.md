---
name: scalev-html-mode
description: Build, debug, and review Scalev HTML Mode landing pages and checkout pages. Use when Codex works on Scalev custom HTML pages, Scalev checkout pages, Scalev bundle price options, payment methods such as QRIS/DANA/ShopeePay/GoPay, after-checkout redirects, digital product checkout, or Scalev runtime APIs like Scalev.data.get(), Scalev.checkout.createOrder(), validateDiscount(), and estimateSummary().
---

# Scalev HTML Mode

Use this skill for Scalev HTML Mode landing pages and checkout pages. Keep output compatible with Scalev dashboard import.

## Core Rules

- Use `window.Scalev` runtime only. Do not call private Scalev API endpoints directly from page HTML.
- Read page data from `Scalev.data.get()`.
- Treat `store.products[0].variants[0]` as primary product variant source.
- Do not use `product.price` as main price source. Prefer `product.variants[0].price`.
- For digital products, remove address, shipping, destination, courier, and delivery sections.
- For digital checkout, avoid `estimateSummary()` unless shipping/destination fields are required and available.
- Render payment methods from `store.paymentMethodOptions`, not hardcoded lists.
- Sort QRIS first during render if requested.
- Respect `Scalev.data.get().afterCheckout` for post-order redirect unless user explicitly asks for custom override.
- For order bump, prefer dashboard-driven data: `store.products[1]` plus `store.bundlePriceOptions[1]`.
- If order bump promo price is made through Scalev bundle pricing, submit bump as `type: "bundle"`, not `type: "product"`.
- Scalev product images may be `images: ["https://..."]`; support string image arrays as well as object arrays.

## Workflow

1. Identify page type: landing page, checkout page, thank-you page, or debugging task.
2. Read product model from Scalev data: product, variant, bundle price option, payment methods, and after-checkout setting.
3. Choose correct checkout item payload.
4. If order bump exists, map it from the second product and second bundle price option.
5. Build UI sections with simple mobile-first HTML/CSS/JS.
6. Validate required inputs before `createOrder()`.
7. Submit order through `Scalev.checkout.createOrder(payload)`.
8. Redirect through Scalev after-checkout setting.
9. Confirm checkout DOM render targets match JS lookups (`id="product-content"`, `id="payment-content"`, `id="summary-content"`, and order bump target IDs when used).
10. Keep checkout spacing responsive: base mobile card gaps, safe coupon row layout, and no flex text overflow.
11. Run `node scripts/check-html-js.mjs <file.html>` when editing local HTML.

## Starter Templates

Use bundled templates when user asks for a fresh page:

- `assets/templates/checkout-digital.html` for digital checkout pages.
- `assets/templates/landing-digital-template.html` for reusable digital product landing pages.
- `assets/templates/checkout-digital-template.html` for reusable digital product checkout pages with bundle/order-bump support.

Adapt copy, styling, and sections to user context, but keep Scalev runtime access, checkout payload, and redirect logic aligned with this skill.

## Checkout Payload Patterns

Use bundle payload when checkout sells a bundle price option:

```js
items: [{
  type: "bundle",
  bundlePriceOptionUniqueId: priceOption.uniqueId,
  quantity: 1
}]
```

Use product payload when checkout sells a normal product variant:

```js
items: [{
  type: "product",
  variantUniqueId: variant.uniqueId,
  quantity: 1
}]
```

Do not mix `type: "product"` with `bundlePriceOptionUniqueId`. Scalev can ignore bundle pricing and charge wrong amount.

## Order Bump Pattern

Use order bump on checkout page when user adds a second product in Scalev dashboard. Keep name, image, and prices dynamic.

Expected mapping:

- Main offer: `store.products[0]` and `store.bundlePriceOptions[0]`.
- Order bump: `store.products[1]` and `store.bundlePriceOptions[1]`.

Render bump only when both second product and second bundle price option exist. Hide the section otherwise.

For mobile order bump UI, stack image above copy. Do not keep image and copy side-by-side on small screens because text space becomes too narrow. Use natural image ratio to avoid cropping:

```css
@media (max-width: 480px) {
  .order-bump-content { flex-direction: column; align-items: stretch; }
  .order-bump-image { width: 100%; height: auto; max-height: none; object-fit: contain; }
}
```

When checked, append bundle bump item:

```js
items.push({
  type: "bundle",
  bundlePriceOptionUniqueId: bump.priceOption.uniqueId,
  quantity: 1
});
```

Update client-side summary when checkbox changes. Total should equal main promo price plus bump promo price. Do not hardcode bump product name, image, normal price, or promo price.

## Redirect Pattern

- `success_page`: redirect to `order.paymentUrl` if present, else `/o/{secretSlug}/success`.
- `direct_to_whatsapp`: redirect to order handler WhatsApp if provided.
- `direct_to_custom_whatsapp`: redirect to configured custom WhatsApp.
- `other_page`: redirect to configured page path.
- `custom_url`: redirect to configured URL.
- In iframe, use `window.parent.postMessage(url, "*")`; otherwise use `window.location.assign(url)`.

## Pixel / Analytics

- Scalev injects Meta Pixel and analytics scripts server-side. Custom HTML must give these scripts time to fire before redirecting.
- Always add configurable delay before `navigateAfterOrder` / `navigate` to allow pixel events to complete.
- Use `pixelDelayMs` config (default 600ms) in checkout templates.
- Pattern: `setTimeout(function() { window.location.assign(url); }, pixelDelayMs);`
- For iframe: `setTimeout(function() { window.parent.postMessage(url, "*"); }, pixelDelayMs);`
- `Scalev.data.get()` currently does not expose dashboard page-event settings. Do not assume `page.events`, `analyticsEvents`, or similar fields exist.
- If user explicitly asks for a specific Meta Pixel ID and event (example: page open = `AddToCart`), hardcode only that requested event + pixel ID in custom HTML.
- For explicit Meta Pixel events, prefer `fbq("trackSingle", pixelId, eventName, params)` so event targets that exact Pixel ID without re-initializing Scalev pixel base code.
- Do not call `fbq("init", pixelId)` again when Scalev already provides `fbq`; re-init can conflict and stop events.
- Do not manually trigger `PageView` unless user explicitly requests it. Scalev/Meta base script may already emit PageView.
- `Scalev.analytics.track(provider, payload)` must use official camelCase payload: `events: [{ eventName, parameters }]`. Do not send top-level `event` or snake_case `event_name`.
- Avoid duplicate purchase conversions. If Scalev payment/success flow or dashboard analytics already fires `Purchase`, do not also fire `Purchase` / `PlaceOrder` from custom checkout HTML after `createOrder()`.
- Pick one purchase conversion point: order created in custom HTML, payment success page, or Scalev dashboard flow. Do not use more than one unless browser and server events share a deterministic event ID for deduplication.

## SEO Metadata

- Replace default titles such as `Scalev HTML Mode Page`, `Checkout`, or `Landing Produk Digital` before delivery.
- Landing pages should include product-specific `<title>`, `meta description`, Open Graph, Twitter card, and `robots` set to `index, follow` unless user wants a private/noindex page.
- Checkout pages should include product-specific `<title>` and `meta description`, but use `robots` set to `noindex, nofollow` so payment/data-entry pages do not appear in search results.
- Keep SEO copy static in the HTML head. If a reusable template has config-driven copy, update `document.title` and matching meta tags from the config during render.

## References

Load only needed references:

- `references/runtime-data.md` for Scalev data shapes.
- `references/checkout-patterns.md` for checkout payload and digital product patterns.
- `references/after-checkout.md` for redirect behavior.
- `references/landing-patterns.md` for landing page structure.
- `references/common-bugs.md` for known bugs and fixes.

## Validation

Run this syntax check after changing generated or local HTML with inline scripts:

```bash
node scripts/check-html-js.mjs path/to/page.html
```

This checks inline `<script>` blocks for JavaScript syntax errors and common checkout DOM contract mismatches. It does not verify Scalev runtime data, payment behavior, or dashboard configuration.

For checkout QA, confirm all of these render before delivery:

- Product summary.
- Payment methods from `store.paymentMethodOptions`.
- Client-side order summary.
- Order bump when `store.products[1]` plus `store.bundlePriceOptions[1]` exist.
- Coupon row on desktop and mobile.
