## Summary
- 

## Page Type
- [ ] Landing page
- [ ] Checkout page
- [ ] Thank-you page
- [ ] Skill docs/reference
- [ ] Validation script

## Scalev Safety Checklist
- [ ] Read `SKILL.md` and relevant `references/*` docs.
- [ ] No private Scalev API endpoint calls from HTML.
- [ ] Product data stays dynamic from `Scalev.data.get()`.
- [ ] Main price uses `product.variants[0].price`.
- [ ] Payment methods use `store.paymentMethodOptions`.
- [ ] Redirect follows `afterCheckout.type`.
- [ ] Checkout redirects include pixel delay.
- [ ] Order bump logic uses dynamic store data when present.

## Validation
- [ ] Ran `npm run validate`.
- [ ] Manually reviewed changed HTML for hardcoded product/payment/pixel values.
