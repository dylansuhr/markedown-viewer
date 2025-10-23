# CLAUDE.md

Claude Code, welcome. Follow these guardrails when contributing to Markdown Viewer.

## Read This First
- Treat `CONTRIBUTING.md` as the source of truth for workflows and commands.
- Use `docs/ARCHITECTURE.md` for module responsibilities and IPC flow; `docs/DEVELOPMENT.md` lists macOS QA rituals.
- All notable refactors or fixes should append a short entry to `docs/PROGRESS_LOG.md`.

## Workflow Notes
- Run `npm run lint`, `npm run format:check`, `npm run check:icons`, and `npm run build:unsigned` before handing results back when relevant. If `iconutil` fails, mention it explicitly.
- Keep macOS affordances intact: menu accelerators, document-edited dot, window state persistence, and drag-and-drop. When touching these areas, test via Finder as well as `npm start`.
- Extend IPC by updating `src/shared/constants.js`, `src/preload/preload.js`, `src/renderer/js/services/ipcService.js`, and `src/main/ipc/handlers.js` together.
- Renderer globals (`Editor`, `Preview`, `Toolbar`, `IPCService`, `MarkdownService`) are singletons; prefer enhancing their methods rather than creating new globals.

## Reporting Back
- Summaries must list scope, validation, macOS version (if you ran GUI smoke tests), and follow-up tasks.
- If documentation drifts, update `CONTRIBUTING.md` and note the change in `docs/PROGRESS_LOG.md`; avoid duplicating long command lists in multiple places.

Coordinate with Codex via `AGENT.md`; both guides point back to the shared contribution workflow so we stay aligned.
