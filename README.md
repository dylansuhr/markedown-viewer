# Simple Markdown Viewer for Mac

A minimalist desktop application for viewing and editing Markdown files on macOS.

## Features

- **Simple & Clean**: No unnecessary features, just markdown editing and preview
- **Three View Modes**:
  - Edit mode: Focus on writing
  - Preview mode: See rendered markdown
  - Split mode: Edit and preview side-by-side
- **File Operations**: Open, Save, Save As with keyboard shortcuts
- **Live Preview**: See changes as you type (in split mode)
- **Native Mac App**: Follows macOS design guidelines

## Installation

### For Users (Download Ready-to-Use App)

1. Download the `.dmg` file from releases
2. Open the `.dmg` file
3. Drag "Markdown Viewer" to your Applications folder
4. First time opening: Right-click the app and select "Open" (required for apps not from App Store)

### For Developers (Build from Source)

1. **Prerequisites**: Install Node.js (v16 or later) from [nodejs.org](https://nodejs.org/)

2. **Clone/Download this repository**

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the app in development mode**:
   ```bash
   npm start
   ```

5. **Code quality**:
   ```bash
   # Lint code
   npm run lint

   # Format code
   npm run format
   ```

6. **Build the distributable app**:
   ```bash
   npm run build
   ```

   Or if you want to build without code signing:
   ```bash
   npm run build -- --mac.identity=null
   ```

   This will create a `.dmg` file in the `dist` folder that you can distribute.

### Project Structure

This app follows a professional, modular architecture:
- **src/main/** - Main Electron process (window management, file I/O, menus)
- **src/renderer/** - Renderer process (UI components, markdown rendering)
- **src/preload/** - Security bridge between processes
- **src/shared/** - Shared constants and utilities
- **docs/** - Comprehensive documentation

See `docs/ARCHITECTURE.md` for detailed architecture documentation and `CLAUDE.md` for development guidance.

## Usage

- **Open a file**: `Cmd+O` or File → Open
- **Save**: `Cmd+S` or File → Save
- **Save As**: `Cmd+Shift+S` or File → Save As
- **Switch views**: Click the Edit/Preview/Split buttons in the toolbar
- **Quit**: `Cmd+Q` or File → Quit

## Supported Markdown Features

- Headers (# ## ### etc.)
- Bold (**text** or __text__)
- Italic (*text* or _text_)
- Links [text](url)
- Code blocks ```
- Inline code `code`
- Lists (- or * or 1.)
- Blockquotes (>)
- Horizontal rules (---)

## Building for Distribution

To create a distributable `.dmg` file that others can download and install:

```bash
# Without code signing (for personal use)
npm run build -- --mac.identity=null

# With code signing (requires Apple Developer account)
npm run build
```

The built `.dmg` file will be in the `dist` folder.

## Troubleshooting

### App won't open ("damaged" or "unidentified developer" warning)

Since this app isn't from the App Store, macOS will show a security warning. To open:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

### Building fails

- Make sure you have Node.js v16 or later
- Try deleting `node_modules` and running `npm install` again
- On M1/M2 Macs, you might need to install Rosetta 2

## License

MIT - Feel free to use and modify as needed.
