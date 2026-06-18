# Security Policy

## Reporting

Report security issues privately to the repository owner. Do not open public issues for vulnerabilities involving checkout payloads, customer data, payment behavior, XSS, or tracking data.

Include:

- Affected file or template.
- Minimal reproduction steps.
- Expected impact.
- Redacted runtime data shape if relevant.

## Scope

Security-sensitive areas:

- Checkout payload creation.
- Redirect behavior after `createOrder()`.
- Customer input rendering.
- Custom analytics or pixel snippets.
- Any code touching `Scalev.data.get()` output.

## Rules

- Never commit real customer data, tokens, secrets, or production dashboard exports.
- Never call private Scalev API endpoints directly from custom HTML.
- Never add third-party scripts without clear user approval and documentation.
