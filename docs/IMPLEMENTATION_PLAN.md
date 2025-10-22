# Implementation Plan - Markdown Viewer Refactoring

## Project Scope

A professional, modular macOS desktop app with these core features:
- ✅ Open markdown files
- ✅ Edit markdown files
- ✅ Preview rendered markdown
- ✅ Side-by-side edit/preview mode
- ✅ Basic file operations (Open, Save, Save As)

## Implementation Checklist

### Phase 1: Project Setup ✅
- [x] Create professional folder structure
- [x] Set up .gitignore
- [x] Configure ESLint
- [x] Configure Prettier
- [x] Install production dependencies (marked)
- [x] Install dev dependencies (eslint, prettier)
- [x] Create package-lock.json

### Phase 2: Security & Architecture ✅
- [x] Create preload script with contextBridge
- [x] Enable contextIsolation in main process
- [x] Disable nodeIntegration in renderer
- [x] Set up IPC channel whitelist
- [x] Create shared constants for IPC channels

### Phase 3: Main Process Refactoring ✅
- [x] Extract window management to mainWindow.js
- [x] Extract menu building to menuBuilder.js
- [x] Create fileService.js for file operations
- [x] Create dialogService.js for file dialogs
- [x] Create IPC handlers module
- [x] Add logger utility
- [x] Add error handler utility
- [x] Update main/index.js to use modules

### Phase 4: Renderer Process Refactoring ✅
- [x] Extract CSS to separate files (main.css, editor.css, preview.css)
- [x] Update index.html to use new structure
- [x] Create editor component (editor.js)
- [x] Create preview component (preview.js)
- [x] Create toolbar component (toolbar.js)
- [x] Create markdownService using marked.js
- [x] Create ipcService for renderer IPC
- [x] Create main app.js to coordinate components

### Phase 5: Assets & Resources ✅
- [x] Move icon.png to assets/icons/
- [x] Create default markdown template
- [x] Organize resource files

### Phase 6: Testing & Validation ✅
- [x] Test file open functionality
- [x] Test file save functionality
- [x] Test file save-as functionality
- [x] Test edit mode
- [x] Test preview mode
- [x] Test split mode
- [x] Test markdown rendering
- [x] Test keyboard shortcuts (Cmd+O, Cmd+S, Cmd+Shift+S)

### Phase 7: Documentation ✅
- [x] Update CLAUDE.md with new structure
- [x] Create ARCHITECTURE.md
- [x] Create DEVELOPMENT.md
- [x] Update README.md with new build instructions

### Phase 8: Build & Distribution ⏳
- [x] Update package.json build configuration
- [x] Test development mode (npm start)
- [ ] Test production build (npm run build)
- [ ] Verify .dmg creation

## Folder Structure

```
markedown-viewer/
├── src/
│   ├── main/
│   │   ├── index.js                 # Main entry point
│   │   ├── window/
│   │   │   └── mainWindow.js        # Window management
│   │   ├── menu/
│   │   │   └── menuBuilder.js       # Menu construction
│   │   ├── services/
│   │   │   ├── fileService.js       # File I/O operations
│   │   │   └── dialogService.js     # System dialogs
│   │   ├── ipc/
│   │   │   └── handlers.js          # IPC event handlers
│   │   └── utils/
│   │       ├── logger.js            # Logging
│   │       └── errorHandler.js      # Error handling
│   ├── renderer/
│   │   ├── index.html               # Main HTML
│   │   ├── js/
│   │   │   ├── app.js               # Renderer main
│   │   │   ├── components/
│   │   │   │   ├── editor.js        # Editor logic
│   │   │   │   ├── preview.js       # Preview logic
│   │   │   │   └── toolbar.js       # Toolbar logic
│   │   │   └── services/
│   │   │       ├── markdownService.js  # Markdown parsing
│   │   │       └── ipcService.js       # IPC wrapper
│   │   └── css/
│   │       ├── main.css             # Base styles
│   │       ├── editor.css           # Editor styles
│   │       └── preview.css          # Preview styles
│   ├── shared/
│   │   └── constants.js             # Shared constants
│   └── preload/
│       └── preload.js               # Security bridge
├── assets/
│   └── icons/
│       └── icon.png                 # App icon
├── resources/
│   └── defaultTemplate.md           # Default content
├── docs/
│   ├── IMPLEMENTATION_PLAN.md       # This file
│   ├── ARCHITECTURE.md              # Architecture docs
│   └── DEVELOPMENT.md               # Dev guide
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
└── README.md
```

## Key Dependencies

### Production
- `electron` - Desktop app framework
- `marked` - Markdown parser (replacing custom parser)
- `electron-store` - Configuration persistence (future)

### Development
- `eslint` - Code linting
- `prettier` - Code formatting
- `electron-builder` - App packaging

## Non-Goals (Future Enhancements)

These are explicitly out of scope for this refactoring:
- File browser/tree view
- Multiple file tabs
- Find/replace functionality
- Syntax highlighting in code blocks
- Export to PDF/HTML
- Auto-save
- Recent files list
- Themes/customization
- Spell check
- Word count
- Table editing helpers

## Progress Tracking

Last Updated: October 22, 2025
Current Phase: Phase 8 - Build & Distribution
Completion: 95%

## Summary

The markdown viewer has been successfully refactored into a professional, modular desktop application with:

✅ **Clean Architecture**: Separated main/renderer processes with clear responsibilities
✅ **Security**: Context isolation enabled, preload script with whitelisted IPC
✅ **Modularity**: Component-based renderer, service-based main process
✅ **Modern Tooling**: ESLint, Prettier, marked.js for parsing
✅ **Professional Structure**: Organized folders, comprehensive documentation
✅ **Tested**: All core features working (open, edit, preview, save)

Remaining tasks:
- Production build testing
- DMG creation verification
