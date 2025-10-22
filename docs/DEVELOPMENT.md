# Development Guide

## Getting Started

### Prerequisites
- Node.js v16 or later
- npm v7 or later
- macOS (for building .dmg files)

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development Commands

### Run in Development Mode
```bash
npm start
```
This launches the app with developer tools enabled.

### Build for Production
```bash
# Without code signing
npm run build -- --mac.identity=null

# With code signing (requires Apple Developer account)
npm run build
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
markedown-viewer/
├── src/
│   ├── main/              # Main process (Node.js)
│   ├── renderer/          # Renderer process (Browser)
│   ├── preload/           # Security bridge
│   └── shared/            # Shared utilities
├── assets/                # Icons, images
├── resources/             # App resources
├── docs/                  # Documentation
└── dist/                  # Build output (generated)
```

## Main Process Development

Located in `src/main/`, runs in Node.js environment.

### Key Modules

**index.js** - Application entry point
- Initializes app
- Creates main window
- Sets up IPC handlers

**window/mainWindow.js** - Window management
- Creates BrowserWindow
- Configures security settings
- Loads renderer HTML

**menu/menuBuilder.js** - Menu construction
- Builds native menu
- Defines keyboard shortcuts
- Links menu items to actions

**services/fileService.js** - File operations
- Read files from disk
- Write files to disk
- Handle file errors

**services/dialogService.js** - System dialogs
- Show open dialog
- Show save dialog
- Configure file filters

**ipc/handlers.js** - IPC communication
- Register IPC handlers
- Validate messages
- Route to appropriate services

## Renderer Process Development

Located in `src/renderer/`, runs in browser environment.

### Key Modules

**js/app.js** - Application controller
- Initialize components
- Coordinate between components
- Set up event listeners

**js/components/editor.js** - Editor component
- Manage textarea
- Handle input events
- Expose content getter/setter

**js/components/preview.js** - Preview component
- Receive markdown
- Render to HTML
- Update preview pane

**js/components/toolbar.js** - Toolbar component
- Manage view mode buttons
- Handle mode switches
- Update UI state

**js/services/markdownService.js** - Markdown parsing
- Parse markdown to HTML
- Configure marked.js options
- Handle parsing errors

**js/services/ipcService.js** - IPC wrapper
- Abstract IPC calls
- Provide clean API
- Handle responses

## Preload Script

Located in `src/preload/preload.js`, runs before renderer.

### Exposed API

```javascript
window.electronAPI = {
  // File operations
  openFile: (callback) => {},
  saveFile: (content) => {},
  saveFileAs: (content) => {},

  // Event listeners
  onFileOpened: (callback) => {},
  onSaveFile: (callback) => {},
  onSaveFileAs: (callback) => {}
}
```

## Adding a New Feature

### 1. Define the Feature
- Update IMPLEMENTATION_PLAN.md
- Document in ARCHITECTURE.md
- Add to feature checklist

### 2. Main Process Changes
- Add service functions if needed
- Create IPC handlers
- Update menu if needed

### 3. Renderer Changes
- Create or modify component
- Add UI elements
- Hook up event handlers

### 4. Update Preload
- Expose new IPC channels
- Add to API surface

### 5. Test
- Test manually in dev mode
- Test production build
- Update checklist

## Debugging

### Main Process
- Logs appear in terminal
- Use `console.log()` statements
- Check electron logs: `~/Library/Logs/markdown-viewer/`

### Renderer Process
- Open DevTools: View → Toggle Developer Tools
- Use browser console
- Inspect elements
- Check network tab for resources

### IPC Communication
- Add logging in handlers.js
- Log in ipcService.js
- Verify channel names match

## Common Tasks

### Changing the App Icon
1. Replace `assets/icons/icon.png`
2. Generate .icns file for macOS
3. Update package.json build config

### Modifying Markdown Rendering
1. Edit `src/renderer/js/services/markdownService.js`
2. Configure marked.js options
3. Test with various markdown files

### Adding a Keyboard Shortcut
1. Edit `src/main/menu/menuBuilder.js`
2. Add accelerator to menu item
3. Link to handler function

### Changing Styles
1. Edit appropriate CSS file in `src/renderer/css/`
2. Use browser DevTools to test
3. Reload app to see changes

## Build Process

### Development Build
- No minification
- Source maps enabled
- Fast rebuild

### Production Build
1. Code is bundled
2. Assets are copied
3. electron-builder packages app
4. DMG file created in `dist/`

### Build Configuration
Located in `package.json` under `build` key:
```json
{
  "build": {
    "appId": "com.yourcompany.markdown-viewer",
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": "dmg"
    }
  }
}
```

## Troubleshooting

### App Won't Start
- Delete `node_modules` and reinstall
- Check Node.js version
- Check for syntax errors in main process

### White Screen on Launch
- Check DevTools console for errors
- Verify index.html path is correct
- Check preload script loaded

### IPC Not Working
- Verify channel names match exactly
- Check preload script is loaded
- Ensure context isolation is configured

### Build Fails
- Check electron-builder logs
- Verify icon files exist
- Check disk space
- Try cleaning build cache

## Code Style

### JavaScript
- Use ES6+ features
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for functions

### File Naming
- camelCase for files: `fileService.js`
- PascalCase for components: `Editor.js` (if using classes)
- kebab-case for CSS: `editor-styles.css`

### Module Exports
```javascript
// Named exports for utilities
export function doSomething() {}

// Default export for main functionality
export default class MyService {}
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [marked.js Documentation](https://marked.js.org/)
- [electron-builder Documentation](https://www.electron.build/)
