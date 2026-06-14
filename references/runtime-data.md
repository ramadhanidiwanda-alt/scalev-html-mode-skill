# Runtime Data

Read runtime data once:

```js
var scalev = window.Scalev && window.Scalev.data && window.Scalev.data.get
  ? window.Scalev.data.get()
  : null;
var store = scalev && scalev.store;
var afterCheckout = scalev && scalev.afterCheckout;
```

Common fields:

- `store.products[]`: selected product list.
- `store.products[0].variants[]`: product variants. Use `variants[0].uniqueId` and `variants[0].price`.
- `store.bundlePriceOptions[]`: bundle price options. Use `bundlePriceOptions[0].uniqueId` and `bundlePriceOptions[0].price`.
- `store.paymentMethodOptions[]`: dashboard-enabled payment methods. Use `value`, `display`, and `logoUrl`.
- `afterCheckout.type`: dashboard after-order action.
- `afterCheckout.customWhatsappPhone`, `otherPagePath`, `customUrl`: optional redirect config.

Price display:

```js
var product = store.products[0];
var variant = (product.variants && product.variants[0]) || {};
var priceOption = (store.bundlePriceOptions && store.bundlePriceOptions[0]) || null;
var normalPrice = Number(variant.price || 0);
var finalPrice = priceOption ? Number(priceOption.price) : normalPrice;
```
