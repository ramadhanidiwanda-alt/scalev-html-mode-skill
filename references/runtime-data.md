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
- Product images can appear as string arrays: `product.images: ["https://cdn..."]`. Also support object arrays such as `product.images[0].url`.

Price display:

```js
var product = store.products[0];
var variant = (product.variants && product.variants[0]) || {};
var priceOption = (store.bundlePriceOptions && store.bundlePriceOptions[0]) || null;
var normalPrice = Number(variant.price || 0);
var finalPrice = priceOption ? Number(priceOption.price) : normalPrice;
```

Image helper:

```js
function productImage(product) {
  if (!product) return "";
  if (product.imageUrl) return product.imageUrl;
  if (product.thumbnailUrl) return product.thumbnailUrl;
  if (product.image) return product.image;
  if (product.coverImageUrl) return product.coverImageUrl;
  if (product.images && product.images.length) {
    if (typeof product.images[0] === "string") return product.images[0];
    return product.images[0].url || product.images[0].imageUrl || product.images[0].src || "";
  }
  return "";
}
```
