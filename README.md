# Scalev HTML Mode Skill

Codex skill for building and debugging Scalev HTML Mode landing pages and checkout pages.

## Covers

- Scalev landing page structure
- Scalev checkout page structure
- Digital product checkout
- Bundle price option payloads
- QRIS/e-wallet payment methods
- After-checkout redirects
- Common Scalev HTML Mode bugs

## Install Locally

Copy or symlink this folder into your Codex skills directory:

```bash
ln -s /Users/macbook/Projects/scalev-html-mode-skill ~/.codex/skills/scalev-html-mode
```

Then trigger with:

```text
Use $scalev-html-mode to create a Scalev checkout page.
```

## Source Layout

```text
scalev-html-mode-skill/
├── SKILL.md
├── README.md
└── references/
    ├── after-checkout.md
    ├── checkout-patterns.md
    ├── common-bugs.md
    ├── landing-patterns.md
    └── runtime-data.md
```

## Example Prompts

See `EXAMPLES.md` for reusable prompts.

## License

MIT License. See `LICENSE`.
