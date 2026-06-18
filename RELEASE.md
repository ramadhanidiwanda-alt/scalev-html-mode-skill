# Release Process

1. Confirm working tree is clean except intended release changes.
2. Run `npm run validate`.
3. Update `VERSION` and `package.json` version.
4. Move `CHANGELOG.md` entries from `[Unreleased]` to release version/date.
5. Create tag, for example `v0.2.0`.
6. Create GitHub Release from tag.

## Release Notes Checklist

Include:

- Added templates.
- Changed Scalev runtime assumptions.
- Fixed checkout, redirect, pixel, or payment bugs.
- Breaking changes and migration notes.
