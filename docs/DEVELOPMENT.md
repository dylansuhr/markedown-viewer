# Development Playbook

This playbook complements `CONTRIBUTING.md` with deeper guidance for day-to-day maintenance. Keep both documents in sync when tooling or architecture evolves.

## Mac-first expectations
- Launch the app via Finder, the Dock, or `npm start`; confirm the hidden inset title bar remains draggable and the document-edited dot reflects the save state.
- Exercise system integrations: open files via `Cmd+O`, the Dock menu, drag-and-drop, and Finder double-click (file associations). After opening, check the Apple ▸ Recent Documents list.
- When adjusting window chrome, update `src/main/window/windowState.js` so the last size/position persists. Never remove the `-webkit-app-region` rules unless you add a replacement drag zone.

## Debugging quick reference
- **Main process**: run `npm start` from Terminal to capture logs. The custom logger prefixes timestamps; search for `ERROR` or `WARN`.
- **Renderer**: `View ▸ Toggle Developer Tools` exposes the standard Chromium console. Test edit/preview/split transitions, dirty state toggles, and markdown rendering regressions here.
- **IPC**: channel names are centralized in `src/shared/constants.js`. When adding a new channel, update `preload`, `ipcService`, and `ipc/handlers` in one commit to avoid runtime mismatch.
- **Window state**: reset by deleting `~/Library/Application Support/Markdown Viewer/window-state.json`.

## Packaging checklist
1. `npm run check:icons` (regenerates the `.iconset` and `.icns`; if `iconutil` fails, run it manually before cutting a release).
2. `npm run build:unsigned` to generate an unsigned DMG for local smoke-tests (use `npm run build` when signing is required).
3. Install from the DMG, open a markdown file, and ensure the Dock icon, menu items, and recent documents behave.
4. Capture a screenshot or screen recording if UI changed; attach it to the release notes.

## Troubleshooting
- **Document dot never clears**: ensure the renderer calls `IPCService.onFileSaved` and that the main process emits `FILE_SAVED` after every successful write.
- **Window duplicates IPC listeners**: `setupIpcHandlers` is idempotent. If you still see duplication, confirm `setMainWindow` is called when recreating the window.
- **Drag-and-drop fails**: Chromium may drop the file as `text/uri-list`; inspect `event.dataTransfer.files` in DevTools. All supported markdown extensions should round-trip through the `REQUEST_OPEN_PATH` channel.
- **Production build issues**: run `DEBUG=electron-builder npm run build` to increase verbosity. Common causes include missing icons and leftover temporary files in `dist/`.

Use `docs/PROGRESS_LOG.md` to capture notable refactors or operational changes so we have a living audit trail.
