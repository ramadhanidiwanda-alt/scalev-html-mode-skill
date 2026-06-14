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

## Workflow

1. Identify page type: landing page, checkout page, thank-you page, or debugging task.
2. Read product model from Scalev data: product, variant, bundle price option, payment methods, and after-checkout setting.
3. Choose correct checkout item payload.
4. Build UI sections with simple mobile-first HTML/CSS/JS.
5. Validate required inputs before `createOrder()`.
6. Submit order through `Scalev.checkout.createOrder(payload)`.
7. Redirect through Scalev after-checkout setting.
8. Run syntax check on embedded JS when editing local HTML.

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

## Redirect Pattern

- `success_page`: redirect to `order.paymentUrl` if present, else `/o/{secretSlug}/success`.
- `direct_to_whatsapp`: redirect to order handler WhatsApp if provided.
- `direct_to_custom_whatsapp`: redirect to configured custom WhatsApp.
- `other_page`: redirect to configured page path.
- `custom_url`: redirect to configured URL.
- In iframe, use `window.parent.postMessage(url, "*")`; otherwise use `window.location.assign(url)`.

## References

Load only needed references:

- `references/runtime-data.md` for Scalev data shapes.
- `references/checkout-patterns.md` for checkout payload and digital product patterns.
- `references/after-checkout.md` for redirect behavior.
- `references/landing-patterns.md` for landing page structure.
- `references/common-bugs.md` for known bugs and fixes.
