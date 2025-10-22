# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A professional, modular macOS Markdown viewer/editor built with Electron. Features three view modes (edit, preview, split) with a clean, security-focused architecture.

## Development Commands

### Running the app
```bash
npm start
```

### Building for distribution
```bash
# Build without code signing (for personal use/testing)
npm run build -- --mac.identity=null

# Build with code signing (requires Apple Developer account)
npm run build
```

The distributable `.dmg` file will be created in the `dist/` folder.

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Installing dependencies
```bash
npm install
```

## Project Structure

```
markedown-viewer/
├── src/
│   ├── main/                   # Main process (Node.js environment)
│   │   ├── index.js            # Main entry point
│   │   ├── window/             # Window management
│   │   ├── menu/               # Menu construction
│   │   ├── services/           # Business logic (file, dialog)
│   │   ├── ipc/                # IPC handlers
│   │   └── utils/              # Utilities (logger, error handler)
│   ├── renderer/               # Renderer process (browser environment)
│   │   ├── index.html          # Main HTML
│   │   ├── js/
│   │   │   ├── app.js          # Application controller
│   │   │   ├── components/     # UI components
│   │   │   └── services/       # Services (markdown, IPC)
│   │   └── css/                # Stylesheets
│   ├── preload/                # Security bridge
│   │   └── preload.js          # Context bridge
│   └── shared/                 # Shared between main/renderer
│       └── constants.js        # IPC channels, configs
├── assets/                     # Icons and images
├── resources/                  # App resources
├── docs/                       # Documentation
│   ├── IMPLEMENTATION_PLAN.md  # Development checklist
│   ├── ARCHITECTURE.md         # Architecture docs
│   └── DEVELOPMENT.md          # Development guide
└── dist/                       # Build output (generated)
```

## Architecture

### Main Process (src/main/)

Entry point: `src/main/index.js`

**Key Modules:**
- **window/mainWindow.js** - BrowserWindow creation and management
- **menu/menuBuilder.js** - Native menu construction with keyboard shortcuts
- **services/fileService.js** - File I/O operations (read, write)
- **services/dialogService.js** - System dialogs (open, save)
- **ipc/handlers.js** - IPC communication handlers, maintains currentFile state
- **utils/logger.js** - Logging utility for debugging
- **utils/errorHandler.js** - Global error handling and user notifications

### Renderer Process (src/renderer/)

Entry point: `src/renderer/index.html` → `src/renderer/js/app.js`

**Component Architecture:**
- **app.js** - Main controller, coordinates all components
- **components/editor.js** - Manages textarea state and input
- **components/preview.js** - Renders markdown to HTML
- **components/toolbar.js** - View mode buttons and filename display
- **services/markdownService.js** - Markdown parsing using marked.js
- **services/ipcService.js** - Wrapper for IPC communication

All components are exposed on the `window` object for cross-module communication.

### Preload Script (src/preload/)

**Security Model:**
- Context isolation: **enabled**
- Node integration: **disabled** in renderer
- IPC whitelisted through `contextBridge`
- Exposes `window.electronAPI` with limited, safe methods

### Shared Constants (src/shared/)

- IPC channel names
- View modes
- File filters
- Window configuration
- Application info

## IPC Communication Flow

### Main → Renderer
- `file-opened`: Sends (content, filename) after file open
- `save-file`: Triggers save for current file
- `save-file-as`: Triggers save with new path

### Renderer → Main
- `file-content`: Sends editor content for save
- `file-content-save-as`: Sends content with target path

All IPC channels are defined in `src/shared/constants.js` to prevent typos.

## Component Interaction Pattern

```
User Action
  ↓
Menu (main) → Dialog Service → File Service
  ↓
IPC Handler → sends event to Renderer
  ↓
IPC Service (renderer) → calls component method
  ↓
Component (Editor/Preview/Toolbar) → updates UI
```

## Key Implementation Details

### View Modes
Managed by Toolbar component:
- **Edit**: Editor visible, preview hidden
- **Preview**: Preview visible, editor hidden
- **Split**: Both visible, real-time rendering

### Markdown Parsing
- Uses **marked.js** library (not custom regex)
- Configured for GitHub Flavored Markdown (GFM)
- Error handling shows user-friendly message in preview

### File Operations
- Current file path stored in `src/main/ipc/handlers.js`
- Save checks if file path exists, otherwise triggers Save As
- All file operations are async with proper error handling

### Error Handling
- Main process: Logged to console with timestamps
- User-facing errors: Native dialog boxes
- Renderer errors: Console only (DevTools in development)

## Security

This app follows Electron security best practices:
1. **Context Isolation**: Enabled
2. **Node Integration**: Disabled in renderer
3. **Preload Script**: Uses contextBridge to expose limited API
4. **IPC Validation**: All channels whitelisted
5. **No Remote Content**: Loads only local files

## Development Tips

### Adding a New Feature
1. Update `docs/IMPLEMENTATION_PLAN.md` with task
2. Implement in appropriate layer (main/renderer)
3. Add IPC channels to `shared/constants.js` if needed
4. Update preload script if new IPC needed
5. Test manually
6. Check off in implementation plan

### Debugging
- Main process logs: Check terminal output
- Renderer logs: View → Toggle Developer Tools
- IPC issues: Check channel names in constants.js match exactly

### File Locations
- Entry point: `src/main/index.js` (defined in package.json)
- Preload script: Loaded relative to `src/main/window/mainWindow.js`
- Renderer HTML: Loaded from `src/renderer/index.html`
- Icons: `assets/icons/icon.png`

## Build Configuration

Located in `package.json` under `build` key:
- Builds for x64 and arm64 architectures
- Creates DMG installer
- Includes `src/`, `assets/`, `resources/` directories
- App category: developer-tools

## Common Issues

**Electron fails to start**: Delete `node_modules/electron` and run `npm install electron`

**White screen**: Check DevTools console for errors, verify preload script path

**IPC not working**: Ensure channel names match in constants.js and all IPC calls

For more details, see:
- `docs/ARCHITECTURE.md` - Detailed architecture documentation
- `docs/DEVELOPMENT.md` - Development guide with examples
- `docs/IMPLEMENTATION_PLAN.md` - Feature checklist and progress
