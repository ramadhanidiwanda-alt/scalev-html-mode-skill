# Scalev HTML Mode Skill

Codex skill for building and debugging Scalev HTML Mode landing pages and checkout pages.

## Covers

- Scalev landing page structure
- Scalev checkout page structure
- Digital product checkout
- Bundle price option payloads
- Dynamic order bump from second product and second bundle price option
- QRIS/e-wallet payment methods
- After-checkout redirects
- Common Scalev HTML Mode bugs

## Install Locally

Copy or symlink this folder into your Codex skills directory:

```bash
ln -s "$PWD" ~/.codex/skills/scalev-html-mode
```

Then trigger with:

```text
Use $scalev-html-mode to create a Scalev checkout page.
```

## Source Layout

```text
scalev-html-mode-skill/
├── agents/
│   └── openai.yaml
├── assets/
│   └── templates/
│       ├── checkout-digital.html
│       ├── checkout-digital-template.html
│       ├── digital-products/
│       │   ├── ebook-ai.html
│       │   ├── ebook-financial.html
│       │   ├── ebook-productivity.html
│       │   ├── template-keuangan.html
│       │   ├── template-keuangan-bisnis.html
│       │   ├── template-keuangan-mahasiswa.html
│       │   └── template-keuangan-rumah-tangga.html
│       └── landing-digital-template.html
├── scripts/
│   └── check-html-js.mjs
├── SKILL.md
├── README.md
└── references/
    ├── after-checkout.md
    ├── checkout-patterns.md
    ├── common-bugs.md
    ├── landing-patterns.md
    └── runtime-data.md
```

## Validate HTML

Check inline JavaScript syntax in generated or edited HTML:

```bash
node scripts/check-html-js.mjs path/to/page.html
```

This catches JavaScript syntax errors inside inline `<script>` blocks. It does not emulate the Scalev runtime.

## Digital Product Landing Templates

Use `assets/templates/digital-products/` for ready-to-adapt landing pages for separate products:

- Template Keuangan
- Template Keuangan Bisnis
- Template Keuangan Rumah Tangga
- Template Keuangan Mahasiswa
- Ebook Financial
- Ebook Productivity
- Ebook AI

Each template includes product-specific copy, SEO metadata, FAQ, disclaimer, and a distinct visual theme. Replace the final CTA `href="#checkout"` with the real Scalev checkout URL before publishing.

## Example Prompts

See `EXAMPLES.md` for reusable prompts.

## License

MIT License. See `LICENSE`.
