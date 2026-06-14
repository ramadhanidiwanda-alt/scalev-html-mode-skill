# After Checkout

Use dashboard setting from `Scalev.data.get().afterCheckout`.

```js
function publicOrderUrl(order) {
  if (order.publicOrderUrl) return order.publicOrderUrl;
  return new URL("/o/" + order.secretSlug, window.location.origin).toString();
}

function paymentInstructionUrl(order) {
  if (order.status === "draft") return publicOrderUrl(order);
  if (order.paymentUrl) return order.paymentUrl;
  var url = new URL(publicOrderUrl(order));
  url.pathname = url.pathname.replace(/\/$/, "") + "/success";
  return url.toString();
}

function navigateAfterOrder(url) {
  if (window.self !== window.top) { window.parent.postMessage(url, "*"); return; }
  window.location.assign(url);
}
```

Map types:

- `success_page` → `paymentInstructionUrl(order)`.
- `direct_to_whatsapp` → handler WhatsApp or order page fallback.
- `direct_to_custom_whatsapp` → configured phone.
- `other_page` → configured path.
- `custom_url` → configured URL.
- fallback → order page.

Do not force QRIS/e-wallet to another redirect unless user explicitly asks. Honor dashboard setting.
