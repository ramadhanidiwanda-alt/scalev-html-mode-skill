# Contributing

Thanks for improving Scalev HTML Mode Skill.

## Before Editing

1. Read `SKILL.md`.
2. Read relevant files in `references/`.
3. Pick existing template from `assets/templates/` before creating a new one.

## Development Rules

- Keep HTML self-contained: inline `<style>` and `<script>`.
- Use vanilla JavaScript only.
- Read Scalev data through `Scalev.data.get()`.
- Do not call private Scalev API endpoints from HTML.
- Do not hardcode product names, prices, payment methods, pixel IDs, or checkout URLs unless docs explicitly allow it.
- Keep checkout redirects delayed with `pixelDelayMs` so analytics can fire.

## Private Local Files

- `private/` is ignored by Git and reserved for local-only product/customer artifacts.
- Never stage, commit, push, or quote real product landing pages from `private/`.
- Use sanitized fixtures in `tests/fixtures/` when examples need to be public.
- Redact product names, customer data, emails, phone numbers, dashboard exports, and tracking IDs before sharing examples.

## Validation

Run:

```bash
npm run validate
```

For one file:

```bash
node scripts/check-html-js.mjs path/to/file.html
```

## Pull Request Checklist

- Explain changed page type or reference doc.
- Include validation output.
- Confirm checkout/payment/redirect rules still follow `SKILL.md`.
