# Contributing to Markdown Viewer

Thank you for helping refine Markdown Viewer. This document explains the day-to-day workflow for maintaining the project and keeping the macOS experience polished.

## Environment
- macOS 13 or later with the Xcode command-line tools installed (required for `iconutil`, notarization, and system dialogs).
- Node.js 18 LTS and npm 9+. Use `nvm use` if you switch between projects.
- Run `npm install` once per clone to pull Electron, marked, ESLint, and Prettier.

## Everyday Commands
- `npm start` launches the development build with the main window in hidden-inset mode and DevTools enabled via the View menu.
- `npm run lint` and `npm run lint:fix` enforce the base ESLint ruleset; address warnings before sending a pull request.
- `npm run format` relies on Prettier for JS/CSS/HTML. Run it after large UI changes.
- `npm run check:icons` (see package.json) rebuilds the `.iconset` folder and validates the `.icns` used during packaging; run it whenever `assets/icons/icon.png` changes.
- `npm run build` creates a production-ready bundle. Add `-- --mac.identity=null` when distributing unsigned test builds.

## Coding Standards
- JavaScript sticks to CommonJS in the main process and modules on the renderer side. Prefer `const`, arrow functions for callbacks, and minimal global state.
- Use two spaces, single quotes, and include a trailing newline. Prettier enforces this automatically.
- Renderer components expose a small API on `window.*`; keep the surface area tight and document new globals in `src/renderer/js/app.js`.
- IPC channel names live in `src/shared/constants.js`. Extend the enum there first, then update `preload`, the service wrapper, and handlers together to avoid drift.
- Any change that touches file persistence must update the document-edited indicator (`BrowserWindow#setDocumentEdited`) via the `set-dirty-state` IPC channel.

## Testing & QA
- We rely on manual QA today. Smoke test `Cmd+O`, `Cmd+S`, `Cmd+Shift+S`, drag-and-drop from Finder, and double-clicking a `.md` file in Finder.
- On macOS ensure the Dock badge, menu items, and recent documents behave correctly. `Console.app` logs under “Markdown Viewer” capture main-process errors.
- When adding renderer logic, exercise split/preview modes and confirm the unsaved indicator clears after the `file-saved` callback fires.
- Optional future work includes Playwright coverage for renderer interactions; document experiments in `docs/PROGRESS_LOG.md`.

## Release Checklist
1. Run `npm run lint`, `npm run format:check`, and `npm run build`.
2. Generate a fresh `.icns` (`npm run check:icons`) so electron-builder packages the right Dock icon.
3. Build unsigned for smoke-testing with `npm run build:unsigned` (or run `npm run build` if you have signing certs available).
4. Verify the DMG in `dist/` launches, respects the last window position, and lists recently opened documents in the Apple menu.
4. Update `CHANGELOG.md` (or note the release in `docs/PROGRESS_LOG.md`) and draft the GitHub release with screenshots when UI changes ship.

## Pull Requests
- Use imperative, present-tense commit messages, e.g., `Add dirty state indicator`.
- Open PRs with: summary, testing notes (commands + macOS version), and a checklist of UI flows touched. Include screen recordings when altering the renderer.
- Keep PRs scoped. If you discover a chore (docs cleanup, tooling), open a follow-up task instead of mixing concerns.

For agent-specific tips, see `AGENT.md` (Codex) or `CLAUDE.md` (Claude Code). Both link back here and highlight any automation quirks.
