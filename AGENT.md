# Codex Guide

This note is for the Codex CLI agent. Follow it before editing.

## Start Here
- Skim `CONTRIBUTING.md` for the canonical workflow (commands, release checklist, style rules).
- Use `docs/ARCHITECTURE.md` when you need deeper context; `docs/DEVELOPMENT.md` covers macOS-specific QA steps.
- Record meaningful work in `docs/PROGRESS_LOG.md` so human teammates have an audit trail.

## Execution Checklist
- Prefer `npm run lint`, `npm run format:check`, `npm run check:icons`, and `npm run build:unsigned` (for DMG smoke tests) to validate work. If `iconutil` fails on CI, leave the `.iconset` in place and mention it in your summary.
- Stick to two-space indentation and CommonJS in the main process. New IPC channels must be added to `src/shared/constants.js` and mirrored in preload + renderer services.
- For renderer changes, update `src/renderer/js/app.js` to keep the dirty-state plumbing intact. Never bypass `IPCService` when touching main processes.
- When altering window chrome or menu items, ensure `setMainWindow` remains accurate and the app menu still exposes About, Preferences, and Recent Documents.

## Communication
- Summaries should list: scope, tests run (or why not), and any follow-up tasks. Note macOS version if you ran GUI smoke tests.
- If you notice drift between docs, default to updating `CONTRIBUTING.md` and link out; avoid duplicating instructions across files.

Coordinate with Claude via `CLAUDE.md`; that file mirrors these expectations and points right back to the shared documentation.
