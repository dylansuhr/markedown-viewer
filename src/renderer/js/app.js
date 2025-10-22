/**
 * Main Application Controller
 * Coordinates all renderer components
 */

/* global Editor, Preview, Toolbar, IPCService */

const App = {
  /**
   * Initialize the application
   */
  init() {
    console.log('Initializing Markdown Viewer');

    // Initialize components
    Editor.init();
    Preview.init();
    Toolbar.init();

    // Setup event handlers
    this.setupEventHandlers();

    // Initial preview update
    this.updatePreview();

    console.log('Markdown Viewer initialized');
  },

  /**
   * Setup all event handlers
   */
  setupEventHandlers() {
    // Handle editor input
    Editor.onInput(() => {
      const mode = Toolbar.getMode();
      if (mode === 'split') {
        this.updatePreview();
      }
    });

    // Handle mode changes
    Toolbar.onModeChange = (mode) => {
      if (mode === 'preview' || mode === 'split') {
        this.updatePreview();
      }
    };

    // Handle IPC events from main process
    IPCService.onFileOpened((content, filename) => {
      console.log(`File opened: ${filename}`);
      Editor.setContent(content);
      Toolbar.setFilename(filename);
      this.updatePreview();
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

      // Update filename display
      const filename = filePath.split('/').pop();
      Toolbar.setFilename(filename);
    });
  },

  /**
   * Update the preview pane
   */
  updatePreview() {
    const content = Editor.getContent();
    Preview.update(content);
  },
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
