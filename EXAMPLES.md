# Example Prompts

## Landing Page

```text
Use $scalev-html-mode to create a Scalev HTML Mode landing page for a digital product. Keep copy simple, mobile-first, and use external CDN assets.
```

## Checkout Page

```text
Use $scalev-html-mode to create a Scalev checkout page for a digital bundle product. Remove shipping/address fields. Use payment methods from Scalev dashboard. Use bundle price option payload.
```

## Checkout From Template

```text
Use $scalev-html-mode and start from assets/templates/checkout-digital.html. Adapt it for a digital ebook checkout and keep Scalev redirect behavior.
```

## Debug Wrong QRIS Amount

```text
Use $scalev-html-mode to debug why Scalev QRIS payment page shows wrong amount after checkout. Check product vs bundle item payload.
```

## Debug Gross Revenue 0

```text
Use $scalev-html-mode to debug Scalev createOrder error: gross_revenue must be between Rp 10.000 and Rp 1.000.000.000.
```

## After Checkout Redirect

```text
Use $scalev-html-mode to make checkout redirect follow Scalev dashboard after-checkout settings.
```

## Add Order Bump

```text
Use $scalev-html-mode to add a dynamic order bump to a Scalev checkout page. The main product is products[0], the order bump is products[1], and both promo prices use bundlePriceOptions.
```

## Validate HTML

```text
Use $scalev-html-mode to validate inline JavaScript syntax in checkout.html with scripts/check-html-js.mjs.
```
