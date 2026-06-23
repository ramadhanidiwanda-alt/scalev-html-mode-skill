# Checkout Patterns

## Digital Product Checkout

Use these sections:

1. Product summary
2. Customer data: name, phone, email
3. Payment method
4. Discount code if needed
5. Order summary
6. Submit button

Remove address and shipping. Digital products do not need destination, courier, or delivery fee.

## Bundle Item Helper

```js
function checkoutItems() {
  var product = store.products[0];
  var variant = (product.variants && product.variants[0]) || {};
  var priceOption = (store.bundlePriceOptions && store.bundlePriceOptions[0]) || null;

  if (priceOption && priceOption.uniqueId) {
    return [{ type: "bundle", bundlePriceOptionUniqueId: priceOption.uniqueId, quantity: 1 }];
  }

  return [{ type: "product", variantUniqueId: variant.uniqueId || product.uniqueId, quantity: 1 }];
}
```

## Create Order

```js
var payload = {
  customer: { name: name, phone: phone, email: email },
  items: checkoutItems(),
  paymentMethod: selectedPaymentMethod
};
if (appliedDiscount) payload.discountCode = appliedDiscount;

window.Scalev.checkout.createOrder(payload).then(function(order) {
  redirectAfterOrder(order);
});
```

## Summary

For digital checkout, render client-side summary from variant and bundle price option. Avoid `estimateSummary()` unless destination/shipping payload exists.

## Order Bump From Second Product

When Scalev checkout page contains two products and the second product is intended as an order bump:

- Main product: `store.products[0]`.
- Order bump product: `store.products[1]`.
- Main bundle price option: `store.bundlePriceOptions[0]`.
- Order bump bundle price option: `store.bundlePriceOptions[1]`.

Render order bump only when `store.products[1]` and `store.bundlePriceOptions[1].uniqueId` exist.

```js
function orderBumpData() {
  var product = store && store.products && store.products[1];
  var priceOption = store && store.bundlePriceOptions && store.bundlePriceOptions[1];
  if (!product || !priceOption || !priceOption.uniqueId) return null;
  var variant = (product.variants && product.variants[0]) || {};
  return {
    product: product,
    priceOption: priceOption,
    normalPrice: Number(variant.price || 0),
    promoPrice: Number(priceOption.price || 0)
  };
}
```

If checked, append order bump as bundle item:

```js
items.push({
  type: "bundle",
  bundlePriceOptionUniqueId: bump.priceOption.uniqueId,
  quantity: 1
});
```

Do not submit bundle-priced order bump as `type: "product"`. That can charge the wrong amount.

### Mobile Layout

On mobile, stack order bump image and copy vertically. Avoid side-by-side layout because it compresses the copy and hurts readability.

```css
@media (max-width: 480px) {
  .order-bump-content { flex-direction: column; align-items: stretch; }
  .order-bump-image { width: 100%; height: auto; max-height: none; object-fit: contain; }
}
```

Do not set a small fixed image height on mobile. It can crop product mockups.

## Checkout DOM Contract

Checkout templates that render content through JavaScript must use stable `id` targets that match the JS lookup exactly. Do not render these targets only as `data-*` attributes when the script calls `$("...")` / `document.getElementById(...)`.

Required targets for digital checkout pages:

```html
<div id="product-content"></div>
<div id="payment-content"></div>
<div id="summary-content"></div>
<div id="order-bump"></div>
```

If the order bump uses a wrapper card plus inner content, keep the JS and HTML contract explicit:

```html
<div id="order-bump-card" style="display:none;">
  <div id="order-bump-content"></div>
</div>
```

Then JS must look up the same IDs:

```js
$("product-content").innerHTML = productHtml;
$("payment-content").innerHTML = paymentHtml;
$("summary-content").innerHTML = summaryHtml;
$("order-bump").innerHTML = bumpHtml;
```

After editing checkout HTML, run:

```bash
node scripts/check-html-js.mjs path/to/checkout.html
```

The validator checks inline JS syntax and common checkout DOM contract mismatches, such as script references to `$("product-content")` without `id="product-content"` in the HTML.

## Coupon / Discount Row Responsive Pattern

Do not reuse a full-width submit button as an inline coupon button without a more specific coupon class. Global submit buttons commonly use `width: 100%`, which breaks desktop coupon rows.

Use this pattern:

```html
<div class="discount-row">
  <input class="input" type="text" id="discount-code" placeholder="Masukkan kode diskon" />
  <button type="button" class="submit-btn discount-btn" id="discount-btn">Pakai</button>
</div>
```

```css
.discount-row { display: flex; gap: 10px; }
.discount-row .input { flex: 1; min-width: 0; }
.discount-row .discount-btn { width: auto; min-width: 88px; min-height: 50px; margin-top: 0; padding: 0 22px; flex: 0 0 auto; }

@media (max-width: 480px) {
  .discount-row { flex-direction: column; }
  .discount-row .discount-btn { width: 100%; }
}
```

Keep the selector `.discount-row .discount-btn` more specific than `.submit-btn` so desktop layout is not overridden by global button styles.

## Local Preview / Demo Mode

When a checkout file is opened locally, `window.Scalev` is unavailable and `Scalev.data.get()` cannot provide `store`. For private previews only, a demo fallback may be used so product, payment methods, order bump, and summary render for visual QA.

Rules:

- Demo mode must activate only when `store` is missing.
- Demo mode must never override real `Scalev.data.get()` data.
- Show a visible banner such as: `Mode Preview — ini data demo`.
- Keep create-order submission guarded by `window.Scalev.checkout.createOrder`; demo mode is for visual QA, not real orders.

## Layout Overflow Safeguards

For checkout layouts with long product names, payment labels, or bundle names, add these safeguards:

```css
.left-col { display: grid; gap: 16px; }
.order-bump-body { min-width: 0; }
.payment-name { min-width: 0; overflow-wrap: anywhere; }
.summary-row span:first-child { min-width: 0; overflow-wrap: anywhere; }
.summary-row strong { flex: 0 0 auto; text-align: right; }
```

These prevent mobile overflow and preserve desktop layout.
