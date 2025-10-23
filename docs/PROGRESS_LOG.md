# Progress Log

## 2024-10-22
- Added macOS-native affordances: hidden-inset title bar, window state persistence, document-edited indicator, drag-and-drop handling, recent document integration, file associations, and open-file routing across app launches.
- Hardened IPC plumbing with dirty-state channel, file-saved acknowledgements, and guardrails against duplicate listener registration.
- Refreshed documentation: introduced `CONTRIBUTING.md`, rewrote `docs/DEVELOPMENT.md`, aligned `CLAUDE.md` and `AGENT.md`, and logged icon generation workflow via `npm run check:icons`.
- Created icon build script (`scripts/build-icons.sh`), added file associations, pointed packaging at the generated `.icns`, updated scripts to regenerate icon assets before builds, and added `npm run build:unsigned` for unsigned DMG generation.
