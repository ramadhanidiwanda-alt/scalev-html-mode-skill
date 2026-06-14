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
