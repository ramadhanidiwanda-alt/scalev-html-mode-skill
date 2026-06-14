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
