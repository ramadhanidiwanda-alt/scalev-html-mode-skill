# Checkout Variant Templates

Standalone Scalev HTML Mode checkout templates with different visual styles and page structures. All templates use `window.Scalev` runtime only.

## Files

| Template | File | Best For |
|---|---|---|
| Split Screen Checkout | `checkout-split-screen.html` | Balanced desktop checkout with product preview beside form |
| Bento Order Bump Checkout | `checkout-bento-order-bump.html` | Bundle offers with dynamic order bump |
| Dark Premium Checkout | `checkout-dark-premium.html` | Premium ebooks, courses, or high-value digital bundles |
| Mobile Sticky Checkout | `checkout-mobile-sticky.html` | Mobile ad traffic with sticky total/CTA |
| Minimal Receipt Checkout | `checkout-minimal-receipt.html` | Simple low-friction checkout for templates or ebooks |

## Runtime Behavior

- Reads `Scalev.data.get()` once.
- Uses `store.products[0]` and `store.bundlePriceOptions[0]` for main offer.
- Uses `store.products[1]` and `store.bundlePriceOptions[1]` for order bump.
- Submits bundle items as `type: "bundle"` when bundle price option exists.
- Renders payment methods from `store.paymentMethodOptions`.
- Redirects through `afterCheckout` with `pixelDelayMs = 600`.
- Does not call private Scalev API endpoints.
- Does not embed analytics or tracking pixels.

## Before Publishing

- Replace static headline/subheadline with product-specific copy.
- Keep `robots="noindex, nofollow"` for checkout pages.
- Test in Scalev dashboard with real product, bundle price option, and payment methods.
- Run `node scripts/check-html-js.mjs assets/templates/checkout-variants/<file>.html` after editing.
