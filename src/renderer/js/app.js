/**
 * Main Application Controller
 * Coordinates all renderer components
 */

/* global Editor, Preview, Toolbar, IPCService, SplitViewResizer */

const App = {
  isDirty: false,

  /**
   * Initialize the application
   */
  init() {
    console.log('Initializing Markdown Viewer');

    // Initialize components
    Editor.init();
    Preview.init();
    Toolbar.init();
    SplitViewResizer.init();

    // Setup event handlers
    this.setupEventHandlers();

    // Initial preview update
    this.updatePreview();

    console.log('Markdown Viewer initialized');
    IPCService.setDirtyState(false);
  },

  /**
   * Setup all event handlers
   */
  setupEventHandlers() {
    // Handle theme changes
    IPCService.onThemeChanged((isDark) => {
      console.log(`Theme changed: ${isDark ? 'dark' : 'light'}`);
      document.body.classList.toggle('dark-mode', isDark);
    });

    // Handle view mode changes from menu shortcuts
    IPCService.onSetViewMode((mode) => {
      console.log(`View mode changed via menu: ${mode}`);
      Toolbar.setMode(mode);
    });

    // Handle editor input
    Editor.onInput(() => {
      const mode = Toolbar.getMode();
      if (mode === 'split') {
        this.updatePreview();
      }
      this.markDirty();
    });

    // Handle mode changes
    Toolbar.onModeChange = (mode) => {
      if (mode === 'preview' || mode === 'split') {
        this.updatePreview();
      }
    };

    // Handle native drag-and-drop from Finder
    this.setupDragAndDrop();

    // Handle IPC events from main process
    IPCService.onFileOpened((content, filename) => {
      console.log(`File opened: ${filename}`);
      Editor.setContent(content);
      Toolbar.setFilename(filename);
      this.updatePreview();
      this.markClean();
    });

    IPCService.onSaveFile(() => {
      console.log('Save file requested');
      const content = Editor.getContent();
      IPCService.saveFile(content);
    });

    IPCService.onSaveFileAs((filePath) => {
      console.log(`Save file as requested: ${filePath}`);
      const content = Editor.getContent();
      IPCService.saveFileAs(content, filePath);

      // Optimistically update filename display until confirmation arrives
      const filename = filePath.split(/[\\/]/).pop();
      if (filename) {
        Toolbar.setFilename(filename);
      }
    });

    IPCService.onFileSaved((_filePath, filename) => {
      console.log(`File saved: ${filename}`);
      if (filename) {
        Toolbar.setFilename(filename);
      }
      this.markClean();
    });
  },

  /**
   * Update the preview pane
   */
  updatePreview() {
    const content = Editor.getContent();
    Preview.update(content);
  },

  /**
   * Toggle dirty indicator on
   */
  markDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
      IPCService.setDirtyState(true);
    }
  },

  /**
   * Toggle dirty indicator off
   */
  markClean() {
    if (this.isDirty) {
      this.isDirty = false;
      IPCService.setDirtyState(false);
    }
  },

  setupDragAndDrop() {
    // Supported file extensions (synchronized with constants.js)
    const VALID_EXTENSIONS = [
      '.md',
      '.markdown',
      '.mdown',
      '.mkd',
      '.mkdn',
      '.txt',
      '.text',
      '.html',
      '.htm',
      '.json',
      '.mdx',
      '.rmd',
      '.adoc',
    ];

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
  },

  /**
   * Show error for invalid file type
   * @param {string} filename - Name of invalid file
   * @param {string} ext - File extension
   */
  showInvalidFileError(filename, ext) {
    IPCService.showError({
      title: 'Unsupported File Type',
      message: `Cannot open "${filename}"`,
      detail: `Markdown Viewer supports markdown (.md, .markdown, .mdx), text (.txt), HTML (.html), and other markup formats. The file you selected has extension: ${ext || 'unknown'}`,
    });
  },
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
