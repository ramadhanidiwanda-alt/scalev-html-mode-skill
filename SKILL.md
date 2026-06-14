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
9. Run syntax check on embedded JS when editing local HTML.

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

## References

Load only needed references:

- `references/runtime-data.md` for Scalev data shapes.
- `references/checkout-patterns.md` for checkout payload and digital product patterns.
- `references/after-checkout.md` for redirect behavior.
- `references/landing-patterns.md` for landing page structure.
- `references/common-bugs.md` for known bugs and fixes.
