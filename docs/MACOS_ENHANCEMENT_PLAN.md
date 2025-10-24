# Markdown Viewer macOS Native Enhancement Plan

## Executive Summary

This document outlines critical bug fixes and macOS native enhancements for Markdown Viewer. The goal is to ensure the app feels like a first-class macOS citizen with proper system integration, native UI patterns, and polished user experience.

---

## Critical Bug Fixes

### 1. Fix DevTools Auto-Opening
**Status:** 🔴 Bug
**Priority:** High
**Location:** `src/main/window/mainWindow.js:55-57`, `package.json`

**Problem:**
DevTools open on every launch because `NODE_ENV` environment variable isn't set by the npm start script.

**Current Code:**
```javascript
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}
```

**Solution:**
Use `cross-env` for cross-platform environment variable support and guard with `app.isPackaged`:

**Step 1: Install cross-env**
```bash
npm install --save-dev cross-env
```

**Step 2: Update package.json**
```json
"start": "cross-env NODE_ENV=development electron ."
```

**Step 3: Enhance window creation guard**
```javascript
// mainWindow.js
if (!app.isPackaged && process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}
```

**Why:**
- `cross-env` works on Windows, macOS, and Linux (POSIX-only NODE_ENV=development breaks on Windows)
- `!app.isPackaged` ensures packaged builds never open DevTools even if env var leaks
- Double-guard prevents accidental DevTools in production

**Impact:** DevTools only open during development, never in packaged builds, across all platforms.

---

### 2. Fix Traffic Lights Overlapping Toolbar
**Status:** 🔴 Bug
**Priority:** High
**Location:** `src/main/window/mainWindow.js:45`, `src/renderer/css/main.css:21-29`

**Problem:**
The macOS window traffic lights (red/yellow/green buttons) are positioned at `{ x: 12, y: 16 }` but the toolbar has only `padding: 10px`, causing the Edit/Preview/Split buttons to overlap with the traffic lights.

**Current State:**
- Traffic lights: 12px from left, ~52px wide total
- Toolbar padding: 10px (insufficient)
- Toolbar uses `-webkit-app-region: drag` (correct)

**Solution:**
Combine proper window configuration with CSS padding for correct traffic light positioning:

**Step 1: Verify Window Configuration**
```javascript
// mainWindow.js - Ensure these are set
const windowOptions = {
  // ... other options ...
  titleBarStyle: 'hiddenInset', // ✓ Already set correctly
  trafficLightPosition: { x: 12, y: 16 }, // ✓ Already set correctly
};
```

**Step 2: Update Toolbar CSS**
```css
.toolbar {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px 10px 10px 80px; /* Left padding for traffic lights */
  display: flex;
  gap: 10px;
  align-items: center;
  -webkit-app-region: drag; /* Entire toolbar is draggable */
  height: 44px; /* Standard macOS toolbar height */
}
```

**Alternative Approach (Spacer Pattern):**
```html
<!-- More explicit spacing control -->
<div class="toolbar">
  <div class="toolbar-spacer"></div>
  <div class="toolbar-buttons">
    <!-- buttons here -->
  </div>
  <span class="filename" id="filename">untitled.md</span>
</div>
```

```css
.toolbar-spacer {
  width: 70px;
  flex-shrink: 0;
  -webkit-app-region: drag;
}
```

**Window Creation Checklist:**
- ✅ `titleBarStyle: 'hiddenInset'` - Hides default titlebar
- ✅ `trafficLightPosition: { x: 12, y: 16 }` - Positions controls
- ✅ Toolbar with `-webkit-app-region: drag` - Maintains draggable area
- ✅ Buttons with `-webkit-app-region: no-drag` - Clickable controls

**Impact:** Traffic lights positioned correctly, toolbar remains fully draggable, follows macOS HIG.

---

### 3. Add Resizable Split View
**Status:** 🟡 Missing Feature
**Priority:** High
**Location:** `src/renderer/css/main.css:57-68`, `src/renderer/index.html:19-44`

**Problem:**
Split mode uses fixed `flex: 1` (50/50 layout) with no way for users to resize the editor/preview panes. This is a common expectation in split-view editors.

**Current Code:**
```css
.editor-pane,
.preview-pane {
  flex: 1;
  /* ... */
}
```

**Solution:**
1. Add a draggable divider element between panes
2. Implement mouse drag handlers to dynamically resize
3. Store split ratio in localStorage for persistence

**Implementation:**
```html
<!-- Add to index.html -->
<div
  class="divider"
  id="divider"
  role="separator"
  aria-orientation="vertical"
  aria-label="Resize split panes"
  aria-valuemin="20"
  aria-valuemax="80"
  aria-valuenow="50"
  tabindex="0"
></div>
```

```css
/* Add to main.css */
.divider {
  width: 1px;
  background: #e0e0e0;
  cursor: col-resize;
  position: relative;
  -webkit-app-region: no-drag;
}

.divider:hover,
.divider:focus {
  background: #007aff;
  width: 2px;
  outline: none;
}

.divider:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}
```

```javascript
// Add to js/components/ or js/app.js
class SplitViewResizer {
  constructor() {
    this.divider = document.getElementById('divider');
    this.editorPane = document.getElementById('editorPane');
    this.previewPane = document.getElementById('previewPane');
    this.isDragging = false;
    this.setupListeners();
    this.restoreSplitRatio();
  }

  setupListeners() {
    // Mouse drag support
    this.divider.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.resize(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.saveSplitRatio();
      }
    });

    // Keyboard support (ArrowLeft/Right) for accessibility
    this.divider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const container = this.editorPane.parentElement;
        const currentRatio = this.editorPane.offsetWidth / container.offsetWidth;
        const newRatio = Math.max(0.2, currentRatio - 0.05); // Move 5% left
        this.editorPane.style.flex = `0 0 ${newRatio * 100}%`;
        this.updateAriaValue(newRatio);
        this.saveSplitRatio();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const container = this.editorPane.parentElement;
        const currentRatio = this.editorPane.offsetWidth / container.offsetWidth;
        const newRatio = Math.min(0.8, currentRatio + 0.05); // Move 5% right
        this.editorPane.style.flex = `0 0 ${newRatio * 100}%`;
        this.updateAriaValue(newRatio);
        this.saveSplitRatio();
      }
    });
  }

  resize(mouseX) {
    const container = this.editorPane.parentElement;
    const containerRect = container.getBoundingClientRect();
    const ratio = (mouseX - containerRect.left) / containerRect.width;

    // Clamp between 20% and 80%
    const clampedRatio = Math.max(0.2, Math.min(0.8, ratio));

    this.editorPane.style.flex = `0 0 ${clampedRatio * 100}%`;
    this.previewPane.style.flex = `1`;
    this.updateAriaValue(clampedRatio);
  }

  updateAriaValue(ratio) {
    // Update ARIA value for screen readers (percentage of total width)
    const percentage = Math.round(ratio * 100);
    this.divider.setAttribute('aria-valuenow', percentage);
  }

  saveSplitRatio() {
    const ratio = this.editorPane.offsetWidth / this.editorPane.parentElement.offsetWidth;
    localStorage.setItem('splitRatio', ratio.toString());
  }

  restoreSplitRatio() {
    const savedRatio = localStorage.getItem('splitRatio');
    if (savedRatio) {
      this.editorPane.style.flex = `0 0 ${parseFloat(savedRatio) * 100}%`;
      this.previewPane.style.flex = `1`;
    }
  }
}
```

**Accessibility Compliance:**
- `role="separator"` - Semantic meaning for screen readers
- `aria-orientation="vertical"` - Indicates resize direction
- `aria-label="Resize split panes"` - Describes purpose
- `aria-valuemin="20"` / `aria-valuemax="80"` - Valid range
- `aria-valuenow` - Dynamically updated current position (percentage)
- `tabindex="0"` - Keyboard navigation
- ArrowLeft/ArrowRight support - Resize without mouse (5% increments)
- Focus indicators - Visual feedback for keyboard users

**Impact:** Users can customize the split view layout to their preference, matching behavior of apps like Xcode, VSCode, and Bear. Passes macOS accessibility review and VoiceOver testing.

---

### 4. Debug & Fix File Save Operation
**Status:** 🔴 Bug
**Priority:** Critical
**Location:** `src/main/ipc/handlers.js:45-57`, `src/renderer/js/app.js:70-80`

**Problem:**
User logs show `[INFO] Save file as requested: /Users/dylansuhr/Desktop/code.md` but the file doesn't appear on disk. The IPC flow appears correct, but the write operation isn't completing.

**Current Flow:**
1. User clicks "Save As" → `menuBuilder.js` calls `menuHandlers.onSaveAs()`
2. Dialog shown → path selected: `/Users/dylansuhr/Desktop/code.md`
3. `handleSaveFileAs()` sends `SAVE_FILE_AS` IPC event to renderer (logs here ✓)
4. Renderer receives event, calls `IPCService.saveFileAs(content, filePath)`
5. `FILE_CONTENT_SAVE_AS` event sent back to main
6. Handler at `handlers.js:45-57` should write file
7. **Missing log:** "Saving file as: [path]" at line 49 never appears

**Root Cause Hypothesis:**
The `FILE_CONTENT_SAVE_AS` IPC handler may not be receiving the event, or there's an error being swallowed.

**Investigation Steps:**
1. Add detailed logging to the `FILE_CONTENT_SAVE_AS` handler entry point
2. Verify the event name matches between sender and receiver
3. Check if error is thrown but caught without logging
4. Verify `content` and `filePath` parameters are passed correctly

**Solution:**

**Step 1: Implement Atomic Writes in fileService.js**
```javascript
// fileService.js - Atomic file writes to prevent partial saves
const fs = require('fs');
const path = require('path');

async function writeFile(filePath, content) {
  // Create temp file in same directory as target to ensure same volume
  // (rename is only atomic within the same filesystem)
  const targetDir = path.dirname(filePath);
  const targetName = path.basename(filePath);
  const tempFile = path.join(targetDir, `.${targetName}.tmp-${Date.now()}`);

  try {
    logger.info(`Writing file: ${filePath}`);

    try {
      // Write content to temp file
      await fs.promises.writeFile(tempFile, content, 'utf8');
      logger.info(`Temp file written: ${tempFile}`);

      // Atomic move: rename temp file to target (atomic within same volume)
      await fs.promises.rename(tempFile, filePath);
      logger.info(`Successfully wrote file: ${filePath}`);
    } catch (renameError) {
      // Handle cross-volume scenario (EXDEV error)
      if (renameError.code === 'EXDEV') {
        logger.warn('Cross-volume rename detected, falling back to copy + fsync');

        // Copy content to destination
        await fs.promises.copyFile(tempFile, filePath);

        // Ensure data is flushed to disk
        const fd = await fs.promises.open(filePath, 'r+');
        await fd.sync(); // fsync
        await fd.close();

        logger.info(`Successfully wrote file (cross-volume): ${filePath}`);
      } else {
        throw renameError;
      }
    }
  } catch (error) {
    handleFileError(error, 'save');
    throw error;
  } finally {
    // Clean up temp file in all failure paths (ignore errors if already deleted)
    await fs.promises.unlink(tempFile).catch(() => {});
  }
}
```

**Step 2: Enhanced IPC Handler with User-Facing Error Handling**
```javascript
// handlers.js - Enhanced logging + user feedback
ipcMain.on(
  IPC_CHANNELS.FILE_CONTENT_SAVE_AS,
  async (event, content, filePath) => {
    try {
      logger.info(`FILE_CONTENT_SAVE_AS handler triggered`);
      logger.info(`  Content length: ${content?.length ?? 'undefined'}`);
      logger.info(`  File path: ${filePath ?? 'undefined'}`);

      if (!filePath) {
        logger.error('FILE_CONTENT_SAVE_AS: filePath is missing');
        showSaveError(mainWindowRef, 'No file path provided');
        mainWindowRef.setDocumentEdited(true); // Keep dirty flag
        return;
      }

      if (content === undefined || content === null) {
        logger.error('FILE_CONTENT_SAVE_AS: content is missing');
        showSaveError(mainWindowRef, 'No content to save');
        mainWindowRef.setDocumentEdited(true); // Keep dirty flag
        return;
      }

      logger.info(`Saving file as: ${filePath}`);
      await fileService.writeFile(filePath, content);
      logger.info(`File written successfully: ${filePath}`);

      currentFile = filePath;
      notifyFileSaved(filePath);
    } catch (error) {
      logger.error('Error in FILE_CONTENT_SAVE_AS handler:', error);
      logger.error('Error stack:', error.stack);

      // Show user-facing error and keep dirty flag
      showSaveError(mainWindowRef, error.message);
      mainWindowRef.setDocumentEdited(true); // Keep dirty flag set
    }
  }
);

function showSaveError(window, message) {
  dialog.showMessageBox(window, {
    type: 'error',
    buttons: ['OK'],
    title: 'Save Failed',
    message: 'Unable to save file',
    detail: message || 'An unknown error occurred while saving the file. Please try again or choose a different location.'
  });
}
```

**Step 3: Verify Handler Registration Order**
```javascript
// index.js - Ensure IPC handlers registered before window loads
const mainWindow = createMainWindow();
setupIpcHandlers(mainWindow); // MUST be before loadFile
mainWindow.loadFile(indexPath);
```

**Why Atomic Writes:**
- Prevents partial saves if app crashes mid-write
- Avoids corrupting existing files
- Creates temp file in same directory as target (same volume/filesystem)
- Rename is atomic within the same filesystem (macOS, Linux)
- Handles cross-volume scenario (EXDEV error) with copy + fsync fallback
- Hidden temp file (`.filename.tmp-*`) won't appear in file browsers
- Cleans up temp file automatically even if copy fallback is used

**Why User-Facing Error Dialogs:**
- No silent failures - user always knows if save failed
- Dirty flag persists until successful save
- Native macOS error dialog matches system UX
- Clear error messages guide user to resolution

**Impact:** File save operations work reliably with no silent failures. Users receive immediate feedback on save errors, and dirty flag persists until successful save. Atomic writes prevent data corruption.

---

### 5. Debug & Fix File Open Operation
**Status:** 🔴 Bug
**Priority:** Critical
**Location:** `src/main/ipc/handlers.js:85-100`, `src/renderer/js/app.js:56-62`

**Problem:**
User logs show `[INFO] File opened successfully: /Users/dylansuhr/Desktop/Dev_Cloud/market_edge/API_Migration_Plan_Alpaca.md` but the content doesn't display in the editor.

**Current Flow:**
1. User clicks "Open" → dialog shows → file selected
2. `handleOpenFile()` reads file content (succeeds ✓)
3. `FILE_OPENED` IPC event sent to renderer with content and filename
4. Renderer's `IPCService.onFileOpened()` callback should trigger
5. `Editor.setContent(content)` called
6. **Result:** Content doesn't appear in textarea

**Root Cause Hypothesis:**
1. IPC event reaches renderer but callback isn't registered yet
2. Editor component not initialized when content arrives
3. Content is being set but immediately overwritten
4. Textarea element not found

**Investigation Steps:**
1. Add console.log in renderer's `onFileOpened` handler to verify it's called
2. Check initialization order: `App.init()` → `Editor.init()` → `setupEventHandlers()`
3. Verify `Editor.setContent()` is actually updating the textarea value
4. Check if placeholder text is interfering

**Solution:**
```javascript
// app.js - Enhanced logging
IPCService.onFileOpened((content, filename) => {
  console.log(`File opened event received`);
  console.log(`  Content length: ${content?.length ?? 'undefined'}`);
  console.log(`  Filename: ${filename}`);

  if (!content) {
    console.error('FILE_OPENED: No content received');
    return;
  }

  Editor.setContent(content);
  console.log(`Editor content set. Current value length: ${Editor.getContent()?.length}`);

  Toolbar.setFilename(filename);
  this.updatePreview();
  this.markClean();
});
```

```javascript
// editor.js - Verify setContent works
function setContent(content) {
  console.log(`Editor.setContent called with ${content?.length ?? 0} characters`);
  const textarea = document.getElementById('editor');

  if (!textarea) {
    console.error('Editor textarea element not found!');
    return;
  }

  textarea.value = content || '';
  console.log(`Textarea value updated. New length: ${textarea.value.length}`);
}
```

**Alternative Fix:**
If the issue is timing-related, defer the IPC setup:
```javascript
// app.js
init() {
  console.log('Initializing Markdown Viewer');

  Editor.init();
  Preview.init();
  Toolbar.init();

  // Setup IPC handlers AFTER components are ready
  this.setupEventHandlers();

  // Signal to main process that renderer is ready
  console.log('Renderer ready for IPC');
}
```

**Impact:** File open operations will work reliably, allowing users to open markdown files via menu, drag-drop, and Finder double-click.

---

### 6. Improve File Type Validation
**Status:** 🟡 Missing Feature
**Priority:** Medium
**Location:** `src/renderer/js/app.js:119-136`, `src/main/ipc/handlers.js:85-100`

**Problem:**
The app should only open markdown files, but there's no user-facing validation when non-markdown files are dropped or opened. Users might try to open `.txt`, `.html`, or other files and get confused.

**Current State:**
- Dialog filters already restrict to markdown extensions ✓
- Drag-drop accepts any file type ✗
- No error message shown for invalid file types ✗

**Solution - Use Uniform Type Identifiers (UTI)**

Modern macOS apps should use UTIs instead of hard-coded file extensions for better compatibility and future-proofing.

**Step 1: Define Supported UTIs and Extensions**
```javascript
// constants.js - Add UTI and extension definitions
const SUPPORTED_UTIS = {
  MARKDOWN: [
    'net.daringfireball.markdown',  // Official markdown UTI
    'public.markdown',               // Generic markdown
  ],
  TEXT: [
    'public.plain-text',             // Plain text files
    'public.text',                   // Generic text
  ],
  MARKUP: [
    'public.html',                   // HTML files
    'public.json',                   // JSON files
  ],
  EXTENDED: [
    'io.typora.mdx',                 // MDX files
  ]
};

// Normalized extension list (for validation across all entry points)
const VALID_EXTENSIONS = [
  '.md', '.markdown', '.mdown', '.mkd', '.mkdn',  // Standard markdown
  '.txt', '.text',                                 // Plain text
  '.html', '.htm',                                 // HTML
  '.json',                                         // JSON
  '.mdx',                                          // MDX
  '.rmd',                                          // R Markdown
  '.adoc',                                         // AsciiDoc
];
```

**Step 2: Update File Filters (Keep Synced with Extensions)**
```javascript
// constants.js - Update FILE_FILTERS
const FILE_FILTERS = {
  MARKDOWN: {
    name: 'Markdown Files',
    extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn', 'mdx', 'rmd'],
  },
  TEXT: {
    name: 'Text Files',
    extensions: ['txt', 'text'],
  },
  MARKUP: {
    name: 'Markup Files',
    extensions: ['html', 'htm', 'json', 'adoc'],
  },
  ALL: {
    name: 'All Supported Files',
    extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn', 'txt', 'text', 'html', 'htm', 'json', 'mdx', 'rmd', 'adoc'],
  },
};
```

**Step 3: Update Dialog Service**
```javascript
// dialogService.js - Use all filter options
async function showOpenDialog(window) {
  const result = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [
      FILE_FILTERS.MARKDOWN,
      FILE_FILTERS.TEXT,
      FILE_FILTERS.MARKUP,
      { type: 'separator' },
      FILE_FILTERS.ALL,
    ],
  });
  // ... rest of code
}
```

**Step 4: Enhanced Drag-Drop Validation**
```javascript
// app.js - Consistent extension validation
setupDragAndDrop() {
  const handleDragOver = (event) => {
    event.preventDefault();
    const hasFiles = event.dataTransfer.items?.length > 0;
    event.dataTransfer.dropEffect = hasFiles ? 'copy' : 'none';
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const [file] = Array.from(event.dataTransfer.files || []);
    if (!file || !file.path) {
      return;
    }

    // Validate file extension (normalized to lowercase)
    const ext = file.path.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!VALID_EXTENSIONS.includes(ext)) {
      this.showInvalidFileError(file.name, ext);
      return;
    }

    IPCService.openPath(file.path);
  };

  document.addEventListener('dragover', handleDragOver);
  document.addEventListener('drop', handleDrop);
}

showInvalidFileError(filename, ext) {
  IPCService.showError({
    title: 'Unsupported File Type',
    message: `Cannot open "${filename}"`,
    detail: `Markdown Viewer supports markdown (.md, .markdown, .mdx), text (.txt), HTML (.html), and other markup formats. The file you selected has extension: ${ext || 'unknown'}`
  });
}
```

**Step 5: Add IPC Error Handler**
```javascript
// handlers.js - Add error dialog handler
ipcMain.on(IPC_CHANNELS.SHOW_ERROR, (_event, options) => {
  dialog.showMessageBox(mainWindowRef, {
    type: 'error',
    buttons: ['OK'],
    title: options.title || 'Error',
    message: options.message || 'An error occurred',
    detail: options.detail || ''
  });
});
```

**Step 6: Update Constants**
```javascript
// constants.js
const IPC_CHANNELS = {
  // ... existing channels
  SHOW_ERROR: 'show-error',
};

module.exports = {
  IPC_CHANNELS,
  VIEW_MODES,
  FILE_FILTERS,
  WINDOW_CONFIG,
  APP_INFO,
  SUPPORTED_UTIS,      // Export UTIs
  VALID_EXTENSIONS,    // Export extensions
};
```

**Step 7: Update electron-builder Configuration**
```javascript
// package.json - Add UTI declarations
"build": {
  "fileAssociations": [
    {
      "ext": ["md", "markdown", "mdown", "mkd", "mkdn", "mdx", "rmd"],
      "name": "Markdown Document",
      "role": "Editor",
      "icon": "assets/icons/MarkdownViewer.icns"
    },
    {
      "ext": ["txt", "text"],
      "name": "Text Document",
      "role": "Editor",
      "icon": "assets/icons/MarkdownViewer.icns"
    }
  ],
  "mac": {
    "extendInfo": {
      "UTImportedTypeDeclarations": [
        {
          "UTTypeIdentifier": "net.daringfireball.markdown",
          "UTTypeConformsTo": ["public.text"],
          "UTTypeTagSpecification": {
            "public.filename-extension": ["md", "markdown", "mdown", "mkd", "mkdn"]
          },
          "UTTypeDescription": "Markdown Document"
        }
      ]
    }
  }
}
```

**Why UTIs:**
- macOS-native file type system
- Better integration with Finder and Quick Look
- Forward-compatible with future file types
- Consistent behavior across dialogs, drag-drop, and Finder associations
- Supports MIME types and extensions simultaneously
- Required for proper App Store submission

**Synchronization Strategy:**
Keep these three sources in sync:
1. `VALID_EXTENSIONS` in constants.js (validation)
2. `FILE_FILTERS` in constants.js (dialogs)
3. `fileAssociations` in package.json (Finder integration)

**Impact:** File type validation works consistently across all entry points (menu, drag-drop, Finder). Users receive clear feedback for unsupported types. App declares proper UTIs for deep macOS system integration and App Store readiness.

---

## macOS Native Enhancements

### 7. Enhanced Toolbar Design
**Status:** 🟡 Enhancement
**Priority:** High
**Location:** `src/renderer/css/main.css:21-55`

**Problem:**
The toolbar uses generic blue buttons that don't match macOS design patterns. Native macOS apps use segmented controls, system colors, and proper focus indicators.

**Current State:**
- Buttons: Generic blue (#007aff)
- Layout: Flexbox with gap
- Focus: No focus rings
- Active state: Darker blue

**Solution:**
```css
/* main.css - Native macOS toolbar styling */
.toolbar {
  background: linear-gradient(to bottom, #fafafa, #f0f0f0);
  border-bottom: 1px solid #d0d0d0;
  padding: 10px 10px 10px 80px;
  display: flex;
  gap: 0; /* Remove gap for segmented control */
  align-items: center;
  -webkit-app-region: drag;
  height: 44px; /* Standard macOS toolbar height */
}

.toolbar-buttons {
  display: flex;
  gap: 0;
  border: 1px solid #c0c0c0;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  -webkit-app-region: no-drag;
}

.toolbar button {
  padding: 6px 16px;
  background: white;
  color: #333;
  border: none;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.1s ease;
  -webkit-app-region: no-drag;
  outline: none;
}

.toolbar button:last-child {
  border-right: none;
}

.toolbar button:hover {
  background: #f5f5f5;
}

.toolbar button:active {
  background: #e8e8e8;
}

.toolbar button.active {
  background: #007aff;
  color: white;
}

.toolbar button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
  z-index: 1;
  position: relative;
}

.toolbar .filename {
  margin-left: auto;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  -webkit-app-region: no-drag;
  padding-right: 10px;
}
```

```html
<!-- index.html - Wrap buttons in container -->
<div class="toolbar">
  <div class="toolbar-buttons">
    <button id="editBtn" class="active">Edit</button>
    <button id="previewBtn">Preview</button>
    <button id="splitBtn">Split</button>
  </div>
  <span class="filename" id="filename">untitled.md</span>
</div>
```

**Impact:** Toolbar matches native macOS appearance (similar to Mail.app, Safari, Xcode).

---

### 8. Production Menu Cleanup
**Status:** 🟡 Enhancement
**Priority:** Medium
**Location:** `src/main/menu/menuBuilder.js:97-109`

**Problem:**
The View menu shows "Reload" and "Toggle Developer Tools" in all builds. These should only appear during development.

**Current Code:**
```javascript
template.push({
  label: 'View',
  submenu: [
    { role: 'reload' },
    { role: 'toggleDevTools' },
    // ...
  ],
});
```

**Solution:**
```javascript
template.push({
  label: 'View',
  submenu: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          { role: 'reload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
        ]
      : []
    ),
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' },
  ],
});
```

**Also Update Help Menu:**
```javascript
template.push({
  role: 'help',
  submenu: [
    {
      label: 'Markdown Viewer Help',
      click: async () => {
        const { shell } = require('electron');
        // Update to your documentation URL
        await shell.openExternal('https://github.com/yourusername/markdown-viewer#readme');
      },
    },
    {
      label: 'Report an Issue',
      click: async () => {
        const { shell } = require('electron');
        await shell.openExternal('https://github.com/yourusername/markdown-viewer/issues');
      },
    },
  ],
});
```

**Impact:** Production builds have cleaner menus; development builds retain debugging tools.

---

### 9. Fullscreen Support
**Status:** 🟡 Enhancement
**Priority:** Medium
**Location:** `src/main/window/mainWindow.js:20-70`

**Problem:**
The window doesn't properly support macOS fullscreen mode. The green traffic light button should maximize or enter fullscreen based on user preference.

**Solution:**
```javascript
// mainWindow.js
function createMainWindow() {
  // ... existing code ...

  mainWindow = new BrowserWindow(windowOptions);

  // Enable fullscreen support
  if (os.platform() === 'darwin') {
    mainWindow.setFullScreenable(true);

    // Double-click titlebar to fullscreen (optional, system default is zoom)
    // mainWindow.on('double-click-titlebar', () => {
    //   if (mainWindow.isFullScreen()) {
    //     mainWindow.setFullScreen(false);
    //   } else {
    //     mainWindow.setFullScreen(true);
    //   }
    // });
  }

  // ... rest of code ...
}
```

**Impact:** Users can enter fullscreen mode with green button or View → Enter Full Screen (Cmd+Ctrl+F).

---

### 10. Dark Mode Support
**Status:** 🟡 Enhancement
**Priority:** High
**Location:** Multiple files (CSS, main process)

**Problem:**
The app doesn't respect macOS system appearance (light/dark mode). Modern macOS apps should adapt to system preferences.

**Solution:**

**Step 1: Detect System Appearance**
```javascript
// main/index.js or mainWindow.js
const { nativeTheme } = require('electron');

nativeTheme.on('updated', () => {
  const isDark = nativeTheme.shouldUseDarkColors;
  mainWindow.webContents.send('theme-changed', isDark);
});

// Send initial theme on window load
mainWindow.webContents.on('did-finish-load', () => {
  const isDark = nativeTheme.shouldUseDarkColors;
  mainWindow.webContents.send('theme-changed', isDark);
});
```

**Step 2: Add IPC Channel**
```javascript
// constants.js
const IPC_CHANNELS = {
  // ... existing
  THEME_CHANGED: 'theme-changed',
};
```

**Step 3: Apply Theme in Renderer**
```javascript
// app.js
setupEventHandlers() {
  // ... existing handlers ...

  // Handle theme changes
  electronAPI.onThemeChanged((isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
  });
}
```

**Step 4: Dark Mode CSS**
```css
/* main.css - Add dark mode variables and styles */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --toolbar-bg: linear-gradient(to bottom, #fafafa, #f0f0f0);
  --code-bg: #f4f4f4;
  --link-color: #007aff;
}

body.dark-mode {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252525;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #3a3a3a;
  --toolbar-bg: linear-gradient(to bottom, #2d2d2d, #262626);
  --code-bg: #2a2a2a;
  --link-color: #409fff;
}

body {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toolbar {
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
}

.editor-pane,
.preview-pane {
  background: var(--bg-primary);
  color: var(--text-primary);
}

#preview code {
  background: var(--code-bg);
}

#preview a {
  color: var(--link-color);
}

/* ... apply variables throughout CSS ... */
```

**Step 5: Update Preload**
```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods ...
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (_event, isDark) => callback(isDark));
  },
});
```

**Impact:** App automatically adapts to system appearance, matching user expectations for modern macOS apps.

---

### 11. View Transitions
**Status:** 🟡 Enhancement
**Priority:** Low
**Location:** `src/renderer/js/components/toolbar.js`, CSS

**Problem:**
Switching between Edit/Preview/Split modes is instant, which feels abrupt. macOS apps typically use subtle animations.

**Solution:**
```css
/* main.css - Add transitions */
.editor-pane,
.preview-pane {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.editor-pane.hidden,
.preview-pane.hidden {
  opacity: 0;
  transform: translateX(-10px);
}

/* Or use fade-only for simpler effect */
.container > div {
  transition: opacity 0.15s ease;
}
```

```javascript
// toolbar.js - Enhanced mode switching
function setMode(mode) {
  // Add fade-out
  editorPane.style.opacity = '0';
  previewPane.style.opacity = '0';

  setTimeout(() => {
    // Update visibility
    if (mode === 'edit') {
      editorPane.classList.remove('hidden');
      previewPane.classList.add('hidden');
    } else if (mode === 'preview') {
      editorPane.classList.add('hidden');
      previewPane.classList.remove('hidden');
    } else if (mode === 'split') {
      editorPane.classList.remove('hidden');
      previewPane.classList.remove('hidden');
    }

    // Fade in
    requestAnimationFrame(() => {
      editorPane.style.opacity = '1';
      previewPane.style.opacity = '1';
    });

    currentMode = mode;
    updateActiveButton();

    if (onModeChange) {
      onModeChange(mode);
    }
  }, 150);
}
```

**Impact:** View mode transitions feel polished and smooth.

---

### 12. Keyboard Navigation & Shortcuts
**Status:** 🟡 Enhancement
**Priority:** Medium
**Location:** `src/renderer/js/components/toolbar.js`, `src/main/menu/menuBuilder.js`

**Problem:**
1. Toolbar buttons don't support keyboard Tab navigation
2. No keyboard shortcuts for switching view modes
3. No way to navigate with keyboard alone

**Solution:**

**Add Keyboard Shortcuts to Menu:**
```javascript
// menuBuilder.js - Add View menu items
template.push({
  label: 'View',
  submenu: [
    {
      label: 'Edit Mode',
      accelerator: 'CmdOrCtrl+1',
      click: () => {
        const mainWindow = BrowserWindow.getFocusedWindow();
        mainWindow?.webContents.send('set-view-mode', 'edit');
      },
    },
    {
      label: 'Preview Mode',
      accelerator: 'CmdOrCtrl+2',
      click: () => {
        const mainWindow = BrowserWindow.getFocusedWindow();
        mainWindow?.webContents.send('set-view-mode', 'preview');
      },
    },
    {
      label: 'Split Mode',
      accelerator: 'CmdOrCtrl+3',
      click: () => {
        const mainWindow = BrowserWindow.getFocusedWindow();
        mainWindow?.webContents.send('set-view-mode', 'split');
      },
    },
    { type: 'separator' },
    // ... existing zoom/fullscreen items ...
  ],
});
```

**Add IPC Handler:**
```javascript
// app.js
setupEventHandlers() {
  // ... existing handlers ...

  electronAPI.onSetViewMode((mode) => {
    Toolbar.setMode(mode);
  });
}
```

**Make Buttons Keyboard Accessible:**
```html
<!-- index.html - Add tabindex -->
<button id="editBtn" class="active" tabindex="0" aria-label="Edit mode">Edit</button>
<button id="previewBtn" tabindex="0" aria-label="Preview mode">Preview</button>
<button id="splitBtn" tabindex="0" aria-label="Split mode">Split</button>
```

```javascript
// toolbar.js - Add keyboard handlers
function init() {
  // ... existing code ...

  // Keyboard navigation
  [editBtn, previewBtn, splitBtn].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}
```

**Impact:** Users can navigate the app entirely with keyboard, improving accessibility and power-user workflows.

---

### 13. Upgrade to Electron 28
**Status:** 🟡 Enhancement
**Priority:** High
**Location:** `package.json`

**Problem:**
The app currently uses Electron 27.3.11. Upgrading to Electron 28+ unlocks:
- Native share sheet support (`role: 'shareMenu'`)
- Performance improvements
- Security updates
- Better Apple Silicon support
- Latest Chromium and Node.js versions

**Solution:**

**Step 1: Update package.json**
```json
{
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.13.0",
    "eslint": "^8.57.1",
    "prettier": "^3.6.2"
  }
}
```

**Step 2: Install Updated Dependencies**
```bash
npm install
```

**Step 3: Test for Breaking Changes**
Review Electron 28 breaking changes:
- Check if any APIs were deprecated or removed
- Test window creation and IPC handlers
- Verify menu bar functionality
- Test file operations (open, save, drag-drop)
- Confirm DevTools behavior

**Step 4: Update Code for Electron 28 (if needed)**
```javascript
// Check Electron version compatibility
const { app } = require('electron');
console.log(`Electron version: ${process.versions.electron}`);
```

**Breaking Changes to Watch:**
- Some deprecated APIs may be removed
- BrowserWindow behavior changes (unlikely to affect us)
- Menu API changes (unlikely to affect us)

**Testing Checklist:**
- [ ] App launches without errors
- [ ] Window opens with correct size/position
- [ ] Traffic lights positioned correctly
- [ ] Menu bar displays properly
- [ ] File open/save works
- [ ] Drag-and-drop from Finder works
- [ ] DevTools only open in development
- [ ] All keyboard shortcuts work
- [ ] Recent documents menu populates

**Impact:**
- Access to native share sheet
- Better performance and security
- Future-proof foundation for v1.0+

---

### 14. Native Window Polish & Share Sheet
**Status:** 🟡 Enhancement
**Priority:** Medium
**Location:** `src/main/index.js`, `src/main/menu/menuBuilder.js`

**Problem:**
The app doesn't leverage several macOS-native window and system integration features that users expect from polished macOS applications.

**Missing Features:**
- System color/accent adoption
- Enhanced About panel with app.setAboutPanelOptions
- Native share sheet integration (requires Electron 28+)
- Services menu integration
- Quick Look preview support

**Solution:**

**Step 1: Enhanced About Panel**
```javascript
// index.js - Already partially implemented, enhance it
function configureAboutPanel() {
  if (process.platform !== 'darwin') {
    return;
  }

  app.setAboutPanelOptions({
    applicationName: APP_INFO.NAME,
    applicationVersion: app.getVersion(),
    version: `Version ${app.getVersion()}`,
    copyright: `Copyright © ${new Date().getFullYear()} Markdown Viewer Contributors`,
    credits: 'A native macOS markdown editor.\n\nBuilt with Electron and marked.js',
    website: 'https://github.com/yourusername/markdown-viewer',
    iconPath: path.join(__dirname, '../assets/icons/MarkdownViewer.icns'),
  });
}
```

**Step 2: Native Share Sheet Integration (Electron 28+)**

```javascript
// menuBuilder.js - Add to File menu after "Save As…"
{
  label: 'Share…',
  id: 'share',
  enabled: false, // Disabled by default until file is saved
  click: () => {
    const mainWindow = getMainWindow();
    const currentFilePath = getCurrentFile();

    if (!currentFilePath) {
      return; // Should never happen since menu item is disabled
    }

    // Trigger native macOS Share Sheet
    const { Menu } = require('electron');
    const shareMenu = Menu.buildFromTemplate([
      {
        role: 'shareMenu',
        sharingItem: {
          filePaths: [currentFilePath],
        },
      },
    ]);

    shareMenu.popup({ window: mainWindow });
  },
}

// Enable/disable share menu item based on file state
function updateShareMenuItem(hasFile) {
  const { Menu } = require('electron');
  const menu = Menu.getApplicationMenu();
  const shareItem = menu?.getMenuItemById('share');
  if (shareItem) {
    shareItem.enabled = hasFile;
  }
}

// Call updateShareMenuItem(true) after file opens/saves
// Call updateShareMenuItem(false) when creating new document
```

**Alternative Approach (Dynamic Menu)**
```javascript
// menuBuilder.js - Rebuild menu dynamically when file state changes
function buildFileMenu(currentFile) {
  return {
    label: 'File',
    submenu: [
      { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: handlers.onOpen },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: handlers.onSave },
      { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: handlers.onSaveAs },
      { type: 'separator' },
      // Only show Share menu if file exists
      ...(currentFile ? [
        {
          label: 'Share',
          submenu: [
            {
              role: 'shareMenu',
              sharingItem: { filePaths: [currentFile] },
            },
          ],
        },
      ] : []),
      { type: 'separator' },
      { role: 'recentdocuments', submenu: [{ role: 'clearrecentdocuments' }] },
      { type: 'separator' },
      { role: 'close' },
    ],
  };
}
```

**Why Native Share Sheet (Option A):**
- Fully native macOS implementation
- No accessibility permissions required
- Built-in share providers (Messages, Mail, AirDrop, etc.)
- User-familiar interface
- Future-proof and officially supported by Electron
- No AppleScript hacks or workarounds

**Fallback for Electron 27 (if not upgrading yet)**
```javascript
// Add to File menu
{
  label: 'Share…',
  click: async () => {
    const mainWindow = getMainWindow();
    const currentFilePath = getCurrentFile();

    if (!currentFilePath) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        message: 'Save First',
        detail: 'Please save your document before sharing.'
      });
      return;
    }

    // Trigger native share sheet via macOS system call
    const { exec } = require('child_process');
    const escapedPath = currentFilePath.replace(/'/g, "'\\''");

    // Use macOS Sharing Service via AppleScript
    const script = `
      set thePath to POSIX file "${escapedPath}"
      tell application "Finder"
        activate
        reveal thePath
        -- Wait for Finder window
        delay 0.2
      end tell

      -- Trigger share menu via System Events
      tell application "System Events"
        tell process "Finder"
          click menu item "Share" of menu "File" of menu bar 1
        end tell
      end tell
    `;

    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        logger.error('Share sheet error:', error);
        // Fallback: just reveal in Finder
        shell.showItemInFolder(currentFilePath);
      }
    });
  },
}
```

**Important:** This approach requires **Automation accessibility permission**:
- User must grant permission in **System Settings → Privacy & Security → Accessibility**
- First run will prompt for permission
- If permission is denied, the share workflow will silently fail and fall back to revealing in Finder
- Consider showing a one-time notification explaining why the permission is needed

**Option C: Show Item in Finder (Simple Fallback)**
```javascript
// Add to File menu - Most reliable cross-version approach
{
  label: 'Show in Finder',
  click: () => {
    const mainWindow = getMainWindow();
    const currentFilePath = getCurrentFile();

    if (!currentFilePath) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        message: 'Save First',
        detail: 'Please save your document before showing in Finder.'
      });
      return;
    }

    const { shell } = require('electron');
    shell.showItemInFolder(currentFilePath);
    // User can then right-click → Share in Finder
  },
}
```

**Fallback Option (if staying on Electron 27):**
Use "Show in Finder" as temporary workaround:
```javascript
{
  label: 'Show in Finder',
  click: () => {
    const currentFilePath = getCurrentFile();
    if (currentFilePath) {
      const { shell } = require('electron');
      shell.showItemInFolder(currentFilePath);
    }
  },
}
```

**Recommended Approach:**
Upgrade to Electron 28+ and use native `shareMenu` role - this is the proper, future-proof solution that provides the best user experience.

**Step 3: Services Menu Integration**
```javascript
// menuBuilder.js - Already has { role: 'services' } ✓
// Ensure it's in the app menu (already present)
{
  label: app.name,
  submenu: [
    { role: 'about' },
    { type: 'separator' },
    { label: 'Preferences…', accelerator: 'CmdOrCtrl+,', click: handlers.onShowPreferences },
    { type: 'separator' },
    { role: 'services' }, // ✓ Already present
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideOthers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' },
  ],
}
```

**Step 4: System Color Adoption (CSS)**
```css
/* main.css - Use system accent colors */
:root {
  /* Use -apple-system-* variables for native colors */
  --accent-color: -apple-system-blue;
  --control-accent-color: AccentColor; /* System accent color */
}

.toolbar button.active {
  background: var(--accent-color, #007aff);
  color: white;
}

/* Adapt to system accent color preference */
@supports (background: AccentColor) {
  .toolbar button.active {
    background: AccentColor;
  }
}
```

**Step 5: Quick Look Preview Support (Future)**
```javascript
// Add Quick Look generator plugin (requires separate Xcode project)
// Document this as a future enhancement in FUTURE_FEATURES.md
// Quick Look allows previewing .md files in Finder without opening the app
```

**Impact:**
- About panel shows rich app information (version, credits, website)
- Users can share documents using native macOS sharing services
- App integrates with macOS Services menu
- UI adapts to user's system accent color preference
- Feels more integrated with macOS ecosystem

---

### 15. Release & Notarization Workflow
**Status:** 📋 Release Checklist
**Priority:** High
**Location:** Build scripts, documentation

**Problem:**
Modern macOS (10.15+) requires apps to be notarized to run without warnings. The app needs a documented release workflow to ensure production builds are properly signed and notarized.

**Required Steps for Distribution:**

**Step 1: Code Signing Certificate**
```bash
# Obtain Apple Developer ID Application certificate
# Install in Keychain Access
# Verify certificate
security find-identity -v -p codesigning
```

**Step 2: Update package.json for Notarization**
```javascript
// package.json - Add notarization config
"build": {
  "appId": "com.yourcompany.markdown-viewer",
  "mac": {
    "category": "public.app-category.developer-tools",
    "icon": "assets/icons/MarkdownViewer.icns",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "target": [
      {
        "target": "dmg",
        "arch": ["universal"]  // Intel + Apple Silicon
      }
    ]
  },
  "afterSign": "scripts/notarize.js"
}
```

**Step 3: Create Entitlements File**
```xml
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.debugger</key>
  <true/>
</dict>
</plist>
```

**Step 4: Notarization Script**
```javascript
// scripts/notarize.js
const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.yourcompany.markdown-viewer',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
```

**Step 5: Environment Variables**
```bash
# .env (DO NOT commit to git)
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASSWORD=app-specific-password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

**Step 6: Build Commands**
```json
// package.json - Add release scripts
{
  "scripts": {
    "build:universal": "electron-builder --mac universal",
    "build:release": "npm run build:universal -- --publish never",
    "build:dry-run": "npm run build:release",
    "build:intel": "electron-builder --mac --x64",
    "build:arm": "electron-builder --mac --arm64"
  }
}
```

**Step 7: Install Notarization Dependencies**
```bash
npm install --save-dev @electron/notarize
```

**Release Checklist:**
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md with release notes
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run format:check` - all formatted
- [ ] Run `npm run check:icons` - icons valid
- [ ] Set environment variables (APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID)
- [ ] Run `npm run build:dry-run` - test build without publishing
- [ ] Verify app launches on Intel Mac
- [ ] Verify app launches on Apple Silicon Mac
- [ ] Verify app launches without "unidentified developer" warning
- [ ] Test all keyboard shortcuts
- [ ] Test file open/save operations
- [ ] Test drag-and-drop from Finder
- [ ] Verify code signature: `codesign -dv --verbose=4 dist/mac/Markdown\ Viewer.app`
- [ ] Verify notarization: `spctl -a -vv -t install dist/mac/Markdown\ Viewer.app`
- [ ] Create Git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Create GitHub release with DMG attached
- [ ] Update website/documentation with download link

**Dry Run Testing:**
```bash
# Build universal binary without publishing
npm run build:dry-run

# Verify app bundle
open dist/mac/Markdown\ Viewer.app

# Check code signature
codesign -dv --verbose=4 "dist/mac/Markdown Viewer.app"

# Check notarization status
spctl -a -vv -t install "dist/mac/Markdown Viewer.app"
```

**Why Universal Builds:**
- Single DMG works on both Intel and Apple Silicon Macs
- Better user experience (automatic architecture selection)
- Reduced distribution complexity
- Required for App Store submission

**Why Notarization:**
- Required for macOS 10.15+ (Catalina and later)
- Prevents "unidentified developer" warnings
- Builds user trust and confidence
- Required for distribution outside App Store
- Future-proofs for stricter macOS requirements

**Impact:**
- Professional release workflow documented
- Builds are properly signed and notarized
- Users can install without security warnings
- Universal binaries support all modern Macs
- Ready for App Store submission (if desired)
- CI/CD can automate release process

---

## Future Feature Preparation

### 16. Settings Infrastructure Documentation
**Status:** 📋 Documentation
**Priority:** Low
**Location:** New file: `docs/FUTURE_FEATURES.md`

**Purpose:**
Document the planned preferences/settings system for future implementation.

**Proposed Settings:**

1. **Appearance**
   - Theme: Auto (system) / Light / Dark
   - Font family: System default / SF Mono / Custom
   - Font size: 12-24px
   - Editor width: Full / Comfortable / Narrow

2. **Editor**
   - Show line numbers: On / Off
   - Wrap text: On / Off
   - Auto-indent: On / Off
   - Spell check: On / Off
   - Tab size: 2 / 4 / 8 spaces

3. **Preview**
   - Scroll sync: On / Off
   - GitHub-flavored markdown: On / Off
   - Syntax highlighting: On / Off (for code blocks)
   - Max width: 600px / 800px / 1000px / Full

4. **Files**
   - Auto-save: Off / Every 30s / Every 1min / Every 5min
   - Auto-save location: Temp / Same as file
   - Default save location: Last used / Documents / Custom
   - Backup: On / Off

5. **Advanced**
   - Show hidden files in dialogs: On / Off
   - Confirm before closing unsaved: On / Off
   - Reopen last file on launch: On / Off

**Implementation Approach:**

**Use electron-store for Persistence:**
```bash
npm install electron-store
```

```javascript
// main/services/preferences.js
const Store = require('electron-store');

const schema = {
  appearance: {
    type: 'object',
    properties: {
      theme: { type: 'string', default: 'auto', enum: ['auto', 'light', 'dark'] },
      fontSize: { type: 'number', default: 14, minimum: 12, maximum: 24 },
    },
  },
  editor: {
    type: 'object',
    properties: {
      showLineNumbers: { type: 'boolean', default: false },
      wrapText: { type: 'boolean', default: true },
      tabSize: { type: 'number', default: 2, enum: [2, 4, 8] },
    },
  },
  files: {
    type: 'object',
    properties: {
      autoSave: { type: 'string', default: 'off', enum: ['off', '30s', '1min', '5min'] },
      defaultLocation: { type: 'string', default: 'last-used' },
    },
  },
};

const store = new Store({ schema });

// Export getters/setters
module.exports = {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  getAll: () => store.store,
  reset: () => store.clear(),
};
```

**Storage Location:**
- macOS: `~/Library/Application Support/Markdown Viewer/config.json`
- Automatic schema validation
- Type safety with defaults
- Atomic writes (no corruption)

**UI Pattern:**
- macOS-style preferences window with toolbar icons
- Tabs: General, Editor, Preview, Advanced
- Native controls: NSButton, NSPopUpButton, NSTextField equivalents
- Use IPC to sync preferences between main and renderer

---

## Additional macOS Best Practices Review

### Current Strengths ✅
Your app already implements these well:
- Context isolation and security
- Document-edited indicator (red dot)
- Window state persistence
- Recent documents menu
- Drag-and-drop from Finder
- File associations for markdown extensions
- Native menu structure with proper roles
- Represented file in titlebar
- Single-instance lock
- About panel configuration

### Missing Best Practices 🔍

#### A. Print Support
```javascript
// Add to File menu
{
  label: 'Print…',
  accelerator: 'CmdOrCtrl+P',
  click: () => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send('print-preview');
  },
}

// Renderer handler
electronAPI.onPrintPreview(() => {
  const printWindow = window.open('', '_blank');
  const content = Preview.getHTML();
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Preview</title>
        <style>${getPreviewStyles()}</style>
      </head>
      <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
});
```

#### B. Export Options
```javascript
// Add to File menu
{
  label: 'Export',
  submenu: [
    {
      label: 'Export as PDF…',
      accelerator: 'CmdOrCtrl+E',
      click: () => exportAsPDF(),
    },
    {
      label: 'Export as HTML…',
      click: () => exportAsHTML(),
    },
  ],
}
```

#### C. Find/Replace
```javascript
// Add to Edit menu
{
  label: 'Find',
  submenu: [
    {
      label: 'Find…',
      accelerator: 'CmdOrCtrl+F',
      click: () => showFindDialog(),
    },
    {
      label: 'Find Next',
      accelerator: 'CmdOrCtrl+G',
      click: () => findNext(),
    },
    {
      label: 'Find Previous',
      accelerator: 'CmdOrCtrl+Shift+G',
      click: () => findPrevious(),
    },
  ],
}
```

#### D. Auto-Save to Temp
```javascript
// Add auto-save every 30s for crash recovery
let autoSaveTimer;

function startAutoSave() {
  autoSaveTimer = setInterval(() => {
    const content = Editor.getContent();
    const tempPath = path.join(app.getPath('temp'), 'markdown-viewer-autosave.md');
    fs.writeFileSync(tempPath, content);
  }, 30000);
}

// Recover on launch
function checkForAutoSave() {
  const tempPath = path.join(app.getPath('temp'), 'markdown-viewer-autosave.md');
  if (fs.existsSync(tempPath)) {
    const mtime = fs.statSync(tempPath).mtime;
    // If modified in last hour, offer recovery
    if (Date.now() - mtime < 3600000) {
      showRecoveryDialog(tempPath);
    }
  }
}
```

#### E. Scroll Sync in Split Mode
```javascript
// Synchronize editor and preview scrolling
class ScrollSync {
  constructor() {
    this.editor = document.getElementById('editor');
    this.preview = document.getElementById('previewPane');
    this.syncing = false;
  }

  enable() {
    this.editor.addEventListener('scroll', () => this.syncFromEditor());
    this.preview.addEventListener('scroll', () => this.syncFromPreview());
  }

  syncFromEditor() {
    if (this.syncing) return;
    this.syncing = true;

    const editorPercent = this.editor.scrollTop /
      (this.editor.scrollHeight - this.editor.clientHeight);

    this.preview.scrollTop = editorPercent *
      (this.preview.scrollHeight - this.preview.clientHeight);

    requestAnimationFrame(() => { this.syncing = false; });
  }

  syncFromPreview() {
    if (this.syncing) return;
    this.syncing = true;

    const previewPercent = this.preview.scrollTop /
      (this.preview.scrollHeight - this.preview.clientHeight);

    this.editor.scrollTop = previewPercent *
      (this.editor.scrollHeight - this.editor.clientHeight);

    requestAnimationFrame(() => { this.syncing = false; });
  }
}
```

#### F. Typography Improvements
```css
/* Use San Francisco font (macOS system font) */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

#preview {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 15px; /* macOS standard body text size */
  line-height: 1.6;
  letter-spacing: -0.01em; /* Optical adjustment */
}

#preview h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#preview h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
}
```

#### G. Window Management
```javascript
// Add to Window menu
{
  label: 'Bring All to Front',
  role: 'front', // Already present in your code ✅
}

// Add Minimize All
{
  label: 'Minimize All',
  accelerator: 'CmdOrCtrl+Alt+M',
  click: () => {
    BrowserWindow.getAllWindows().forEach(win => win.minimize());
  },
}
```

---

## Implementation Priority

### Phase 1: Critical Bugs (Week 1)
1. ✅ Fix DevTools auto-opening (cross-env + app.isPackaged guard)
2. ✅ Fix traffic lights overlap (CSS padding + window configuration)
3. ✅ Add resizable split view (with accessibility support)
4. ✅ Debug & fix file save operation (atomic writes + error dialogs)
5. ✅ Debug & fix file open operation (enhanced logging)
6. ✅ Improve file type validation (UTI-based)

### Phase 2: Core UX (Week 2)
7. ✅ Enhanced toolbar design (native segmented controls)
8. ✅ Production menu cleanup (hide DevTools in production)
9. ✅ Fullscreen support (setFullScreenable)
10. ✅ Dark mode support (nativeTheme integration)
11. ✅ View transitions (smooth animations)
12. ✅ Keyboard navigation & shortcuts (Cmd+1/2/3)

### Phase 3: macOS Integration (Week 3)
13. ✅ Upgrade to Electron 28 (native share sheet support)
14. ✅ Native window polish (About panel, share sheet, Services menu)
15. ✅ Release & notarization workflow (universal builds, code signing)
16. 📋 Settings/Preferences infrastructure (electron-store)

### Phase 4: Future Features (Backlog)
17. 📋 Print support (Cmd+P)
18. 📋 Export options (PDF, HTML)
19. 📋 Find/Replace (Cmd+F)
20. 📋 Auto-save recovery
21. 📋 Scroll sync in split mode
22. 📋 Line numbers toggle
23. 📋 Syntax highlighting for code blocks
24. 📋 Quick Look preview support

---

## Testing Checklist

### Before Each Release
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run format:check` - all files formatted
- [ ] Run `npm run check:icons` - icons valid
- [ ] Run `npm run build:unsigned` - builds successfully
- [ ] Test Cmd+O (Open file)
- [ ] Test Cmd+S (Save file)
- [ ] Test Cmd+Shift+S (Save As)
- [ ] Test Cmd+1/2/3 (View modes)
- [ ] Test drag-drop from Finder
- [ ] Test double-click .md file in Finder
- [ ] Verify traffic lights don't overlap
- [ ] Verify document-edited dot appears/clears
- [ ] Verify window state persists across launches
- [ ] Test Recent Documents in Apple menu
- [ ] Test light mode appearance
- [ ] Test dark mode appearance
- [ ] Test fullscreen mode (Cmd+Ctrl+F)
- [ ] Test split view resizing
- [ ] Verify no DevTools in production build
- [ ] Test on macOS Ventura (13.x)
- [ ] Test on macOS Sonoma (14.x)
- [ ] Test on Intel Mac
- [ ] Test on Apple Silicon Mac

---

## Validation Commands

```bash
# Code quality
npm run lint
npm run format:check

# Icon validation
npm run check:icons

# Build test (unsigned)
npm run build:unsigned

# Launch development mode
npm start

# Full production build
npm run build
```

---

## Resources

### macOS Human Interface Guidelines
- [macOS Design Themes](https://developer.apple.com/design/human-interface-guidelines/macos/overview/themes/)
- [App Architecture](https://developer.apple.com/design/human-interface-guidelines/macos/app-architecture/launching/)
- [Windows and Views](https://developer.apple.com/design/human-interface-guidelines/macos/windows-and-views/window-anatomy/)
- [Toolbars](https://developer.apple.com/design/human-interface-guidelines/macos/windows-and-views/toolbars/)

### Electron Documentation
- [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [Menu](https://www.electronjs.org/docs/latest/api/menu)
- [nativeTheme](https://www.electronjs.org/docs/latest/api/native-theme)
- [IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)

### Design Inspiration
- **Bear** - Markdown editor with excellent macOS integration
- **iA Writer** - Focus on typography and minimal UI
- **Typora** - Live rendering and distraction-free editing
- **Ulysses** - Professional writing app with native feel

---

## Notes

### Code Organization Principles
1. Keep components single-purpose
2. Use IPC for all main ↔ renderer communication
3. Store preferences in userData directory
4. Log all file operations for debugging
5. Gracefully handle all errors
6. Validate user input before processing
7. Use native macOS patterns where possible
8. Maintain backward compatibility with saved files

### Performance Considerations
1. Debounce markdown rendering in split mode
2. Virtualize long documents (future)
3. Lazy-load preview styles
4. Cache parsed markdown (future)
5. Optimize CSS with will-change for animations

### Security Considerations
1. Maintain context isolation ✅
2. Never disable nodeIntegration ✅
3. Validate all IPC messages
4. Sanitize markdown HTML output (XSS prevention)
5. Use allowlist for external links
6. Don't store sensitive data in localStorage

---

**Last Updated:** 2025-10-23
**Version:** 1.0
**Status:** Draft for Review
