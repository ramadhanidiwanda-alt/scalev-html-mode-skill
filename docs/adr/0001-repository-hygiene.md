# ADR 0001: Repository Hygiene Baseline

## Status

Accepted

## Context

This repository distributes a Codex skill and HTML template guidance, not a runtime application. Bugs usually come from incorrect checkout, redirect, payment, or runtime-data assumptions.

## Decision

Use lightweight GitHub community files, CI validation, release docs, and clear contribution rules. Keep CI focused on repository-owned validation scripts.

## Consequences

- Pull requests get a Scalev-specific safety checklist.
- Releases have version and changelog discipline.
- Future work can add deeper validators without changing repository process.
