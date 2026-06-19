# Private Checkout Pixel Bugs

Scope: local checkout file `private/landing-pages/co-bundle.html`.

This note documents two observed tracking bugs before changing checkout behavior.

## Implementation status

Applied locally in `private/landing-pages/co-bundle.html`:

- Removed manual `InitiateCheckout` and `AddPaymentInfo` browser Pixel calls from submit click.
- Removed unused `Scalev.analytics.track(...)` helper paths from the private checkout file so submit analytics are owned by Scalev.
- Moved initial `AddToCart` firing to the init phase after DOM helpers and order bump UI are ready.
- Added shared `cartState()` for Meta Pixel params so event value, content IDs, item count, and names are not hardcoded.
- Final tracking decision: page-load `AddToCart` represents the default checkout cart only, so it intentionally excludes order bump until the buyer selects it.
- Removed additional `AddToCart` firing on order bump checkbox change to keep ATC count aligned with checkout page opens rather than cart updates.

Validation run:

```bash
node scripts/check-html-js.mjs private/landing-pages/co-bundle.html
```

Result: `private/landing-pages/co-bundle.html: script 1 OK`.

Note: `private/` is intentionally ignored by git, so the HTML change is local-only unless copied into a tracked fixture/template or explicitly force-added.

## Scalev documentation findings

Relevant docs reviewed:

- Scalev HTML Mode runtime (`https://docs.scalev.com/en/html-mode-runtime`)
- HTML Mode checkout success types (`https://docs.scalev.com/en/html-mode-checkout-success-paths`)

Key points from the docs:

- `Scalev.data.get().store` contains only selected store context: selected products, selected bundle price options, and selected payment method options.
- Runtime keys are camelCase in page JavaScript: `afterCheckout`, `paymentMethodOptions`, `bundlePriceOptions`, `uniqueId`, `paymentUrl`, and `publicOrderUrl`.
- `Scalev.checkout.createOrder(payload)` should only run after intentional form submit. It validates the payload before persisting the order.
- After `createOrder()` succeeds, HTML Checkout Pages automatically fire the configured form-submit analytics events on both client and server side, only for analytics pixels configured on the page.
- Redirect is still manual. The page must read `Scalev.data.get().afterCheckout` and redirect after `createOrder()` resolves.
- Docs warn to add custom analytics only for intentionally separate events, because configured submit events are already fired by Scalev.

## Bug 1 — `AddToCart` value only represents main product

### Symptom

When the checkout page opens, the Meta Pixel `AddToCart` event is sent with a value that only represents the first product / first bundle price option.

This becomes inaccurate if `AddToCart` is meant to represent final cart value after an order bump is selected. For the current tracking strategy, page-load `AddToCart` intentionally represents only the default main product cart because the bump has not been selected yet.

### Evidence

Current `metaPixelParams()` reads only:

- `store.products[0]`
- `product.variants[0]`
- `store.bundlePriceOptions[0]`

The order bump path already exists elsewhere:

- `orderBumpData()` reads `store.products[1]` and `store.bundlePriceOptions[1]`.
- `checkoutItems()` appends the bump bundle item when `orderBumpChecked()` is true.
- `loadSummary()` adds `bump.promoPrice` to the displayed total.

So the checkout payload and UI can include the bump. Page-load `AddToCart` should explicitly opt out of bump inclusion instead of accidentally reading only `[0]`.

### Root cause hypothesis

Tracking params were generated from a separate single-item function instead of an explicit cart-state helper. This made it unclear whether bump exclusion was intentional or a bug.

### Expected behavior

Tracking payloads should be built from a shared cart state with explicit inclusion rules:

- Page-load `AddToCart`: main product / main bundle price option only.
- Checkout submit analytics: owned by Scalev after successful `createOrder()`.
- Purchase: owned by Scalev after successful payment.
- Selected order bump should affect checkout payload, summary, and Scalev-managed submit/purchase analytics, not page-load ATC count.

### Suggested fix direction

Create one cart-state helper and reuse it for:

- `checkoutItems()`
- summary total
- Meta Pixel params
- any future custom analytics payload, if a separate event is intentionally added later

The helper should return selected items, content IDs, content names, and total value. Page-load `AddToCart` should call it with bump inclusion disabled, while checkout summary and payload can include the selected bump.

## Bug 2 — Funnel counts mismatch: ATC 1, IC 1, API 1, Purchase 0

### Symptom

Observed case:

- 2 people opened / interacted enough to submit.
- 1 person bought.
- Meta / analytics showed:
  - `AddToCart`: 1
  - `InitiateCheckout`: 1
  - `AddPaymentInfo`: 1
  - `Purchase`: 0

### Evidence

Current checkout flow sends browser Pixel events manually:

- On page open: `AddToCart` via `ensurePixelAndTrack("AddToCart", ...)`.
- On valid submit click, before `createOrder()`: `InitiateCheckout` and `AddPaymentInfo` via `trackMetaPixel(...)`.
- After `createOrder()` succeeds: no manual `Purchase`; code redirects through `showSuccess(order)`.
- Redirect has `pixelDelayMs = 600`, but this only delays navigation. It does not guarantee a `Purchase` event exists if the destination flow does not fire it or if payment/success tracking is not reached.

### Root cause hypotheses

1. `Purchase` is not emitted by this HTML file, so it depends entirely on Scalev payment/success flow, configured dashboard analytics, or another destination page.
2. Docs say `createOrder()` automatically fires configured form-submit analytics events after success. This file also manually fires `InitiateCheckout` and `AddPaymentInfo` before `createOrder()`, so the custom events may be duplicative or out of sync with Scalev-managed submit analytics.
3. If the after-checkout destination is WhatsApp, custom URL, another page, or a payment URL that does not fire Purchase, then order creation can happen without a Purchase event.
4. `InitiateCheckout` / `AddPaymentInfo` are emitted before `createOrder()` succeeds, so submit attempts can be counted even if order creation later fails.
5. `formPixelEventsTracked` is page-session scoped. A failed first submit can block a later valid submit in the same page view from firing IC/API again.
6. `AddToCart` depends on `fbq` being ready within the retry window and on the hardcoded Pixel ID. If Scalev's injected Pixel is delayed, blocked, or not initialized for that ID, ATC may be missing.

### Expected behavior

Tracking should map clearly to funnel stages:

- Page open / product view: one explicitly defined event, if required.
- Valid checkout intent: `InitiateCheckout` once the cart state and payment method are valid.
- Payment method selected or submitted: `AddPaymentInfo` when payment method is chosen / confirmed.
- Order created / purchase completed: one agreed conversion point, with dedup strategy if both browser and server-side flows can emit it.

### Suggested fix direction

Before changing production tracking, decide conversion ownership:

1. Let Scalev own configured form-submit analytics after `createOrder()` succeeds. Remove or disable manual IC/API unless they are intentionally separate custom browser events.
2. Let Scalev own `Purchase` completely, then verify the exact after-checkout destination fires Purchase for every redirect type used by this page.
3. Or fire `Purchase` in custom HTML after `createOrder()` succeeds, but only if Scalev success/payment flow will not also fire Purchase, or if both sides share the same dedup `event_id`.

Also consider moving IC/API emit after successful `createOrder()` or adding a separate pre-order intent event, so failed submit attempts do not look like successful checkout progress.

## Debug checklist

Use browser devtools and Meta Pixel Helper on a test order:

1. Confirm `fbq` exists before `AddToCart` retry expires.
2. Confirm which Pixel ID receives each event.
3. Log computed tracking value and compare it with summary total.
4. Test without bump and with bump selected.
5. Test each `afterCheckout.type` used by this page.
6. Confirm whether payment/success page emits `Purchase`.
7. Confirm whether Scalev server-side analytics also emits Purchase, to avoid duplicates.

## Notes

- Do not add manual `Purchase` blindly. That can create duplicate purchase conversions if Scalev already fires Purchase in payment/success flow.
- Do not call `fbq("init", pixelId)` again from custom HTML when Scalev already injects Pixel.
- Prefer `fbq("trackSingle", pixelId, eventName, params)` for explicitly requested browser Pixel events.
