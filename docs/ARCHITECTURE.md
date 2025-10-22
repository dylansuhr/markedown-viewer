# Architecture Documentation

## Overview

Markdown Viewer is an Electron-based desktop application following a modular, layered architecture with clear separation between main and renderer processes.

## Core Principles

1. **Separation of Concerns** - Each module has a single, well-defined responsibility
2. **Security First** - Context isolation enabled, minimal IPC surface area
3. **Modularity** - Components can be tested and maintained independently
4. **Simplicity** - Focus on core features without unnecessary complexity

## Process Architecture

### Main Process

The main process manages the application lifecycle, native OS integration, and system-level operations.

```
Main Process
├── index.js                    # Application entry point
├── Window Management           # BrowserWindow lifecycle
├── Menu System                 # Native menu bar
├── File Services              # File I/O operations
├── Dialog Services            # System file dialogs
└── IPC Handlers               # Communication with renderer
```

**Key Responsibilities:**
- Create and manage application windows
- Build native menus
- Handle file system operations
- Show system dialogs (open, save)
- Manage application state

### Renderer Process

The renderer process handles the UI and user interactions, running in a sandboxed environment.

```
Renderer Process
├── Components
│   ├── Editor                 # Markdown text input
│   ├── Preview                # Rendered markdown display
│   └── Toolbar                # View mode controls
├── Services
│   ├── Markdown Service       # Parse markdown to HTML
│   └── IPC Service            # Communication bridge
└── Application Controller     # Coordinates components
```

**Key Responsibilities:**
- Render user interface
- Handle user input
- Parse and display markdown
- Manage view modes (edit/preview/split)
- Communicate with main process for file operations

### Preload Script

Acts as a secure bridge between main and renderer processes.

```
Preload Script
└── Exposed APIs
    ├── fileOperations         # open, save, saveAs
    └── eventListeners         # fileOpened, saveFile, saveFileAs
```

**Security Model:**
- Context isolation enabled
- Node integration disabled in renderer
- Only whitelisted APIs exposed via contextBridge
- IPC channels validated

## Data Flow

### Opening a File

```
User clicks "Open"
    ↓
Menu Handler (main)
    ↓
Dialog Service → shows file picker
    ↓
File Service → reads file content
    ↓
IPC: send 'file-opened' event
    ↓
Renderer receives via preload API
    ↓
Editor Component → updates content
    ↓
Preview Component → renders markdown
```

### Saving a File

```
User clicks "Save"
    ↓
Menu Handler (main)
    ↓
IPC: send 'save-file' event
    ↓
Renderer receives via preload API
    ↓
Editor Component → gets current content
    ↓
IPC: send 'file-content' with data
    ↓
File Service → writes to disk
```

## Component Responsibilities

### Editor Component
- Manage textarea state
- Handle user input
- Notify on content changes
- Support keyboard shortcuts

### Preview Component
- Receive markdown text
- Render to HTML via markdown service
- Update DOM with rendered content
- Handle preview scrolling

### Toolbar Component
- Manage view mode buttons
- Track active mode (edit/preview/split)
- Toggle component visibility
- Update button states

### Markdown Service
- Parse markdown text to HTML using marked.js
- Configure markdown options
- Sanitize output (if needed)

### File Service
- Read files from disk
- Write files to disk
- Handle file errors
- Validate file paths

### Dialog Service
- Show open file dialog
- Show save file dialog
- Configure file filters
- Return user selections

## View Modes

### Edit Mode
- Editor visible, preview hidden
- Full width for editing
- No real-time rendering

### Preview Mode
- Preview visible, editor hidden
- Full width for reading
- Markdown fully rendered

### Split Mode
- Both editor and preview visible
- 50/50 width split
- Real-time rendering as user types

## Error Handling Strategy

1. **File Operations** - Graceful failures with user notifications
2. **Markdown Parsing** - Show error message in preview pane
3. **IPC Communication** - Log errors, don't crash
4. **Window Management** - Prevent data loss on unexpected close

## State Management

### Main Process State
- `currentFile`: Path to currently open file (or null)
- `mainWindow`: Reference to BrowserWindow

### Renderer State
- `currentMode`: Active view mode (edit/preview/split)
- `editorContent`: Current markdown text
- `isDirty`: Whether content has unsaved changes (future)

## IPC Channel Contract

### Main → Renderer
- `file-opened`: (content: string, filename: string)
- `save-file`: ()
- `save-file-as`: (filePath: string)

### Renderer → Main
- `file-content`: (content: string)
- `file-content-save-as`: (content: string, filePath: string)

## File Structure Rationale

```
src/
  main/          # Main process code (Node.js environment)
  renderer/      # Renderer process code (browser environment)
  shared/        # Code used by both processes
  preload/       # Security bridge scripts
```

This structure:
- Clearly separates processes
- Makes security boundaries obvious
- Enables independent testing
- Supports future multi-window architecture

## Technology Stack

- **Electron**: Desktop application framework
- **marked.js**: Markdown parsing library
- **Native JavaScript**: No frontend framework needed for simplicity
- **CSS**: Vanilla CSS for styling

## Future Extensibility

The architecture supports these future enhancements:
- Multiple windows (document-based architecture)
- Plugin system (via IPC channels)
- User preferences (via config service)
- Auto-save (via file service)
- Recent files (via state persistence)
