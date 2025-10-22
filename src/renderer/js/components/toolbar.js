/**
 * Toolbar Component
 * Manages view mode buttons and file name display
 */

const Toolbar = {
  editBtn: null,
  previewBtn: null,
  splitBtn: null,
  filenameSpan: null,
  editorPane: null,
  previewPane: null,
  currentMode: 'edit',

  /**
   * Initialize the toolbar
   */
  init() {
    this.editBtn = document.getElementById('editBtn');
    this.previewBtn = document.getElementById('previewBtn');
    this.splitBtn = document.getElementById('splitBtn');
    this.filenameSpan = document.getElementById('filename');
    this.editorPane = document.getElementById('editorPane');
    this.previewPane = document.getElementById('previewPane');

    // Setup event listeners
    this.editBtn.addEventListener('click', () => this.setMode('edit'));
    this.previewBtn.addEventListener('click', () => this.setMode('preview'));
    this.splitBtn.addEventListener('click', () => this.setMode('split'));
  },

  /**
   * Set view mode
   * @param {string} mode - 'edit', 'preview', or 'split'
   */
  setMode(mode) {
    this.currentMode = mode;

    // Remove active class from all buttons
    this.editBtn.classList.remove('active');
    this.previewBtn.classList.remove('active');
    this.splitBtn.classList.remove('active');

    // Reset panes
    this.editorPane.classList.remove('hidden');
    this.previewPane.classList.remove('hidden');

    switch (mode) {
      case 'edit':
        this.editBtn.classList.add('active');
        this.previewPane.classList.add('hidden');
        this.editorPane.style.flex = '1';
        break;
      case 'preview':
        this.previewBtn.classList.add('active');
        this.editorPane.classList.add('hidden');
        this.previewPane.style.flex = '1';
        break;
      case 'split':
        this.splitBtn.classList.add('active');
        this.editorPane.style.flex = '1';
        this.previewPane.style.flex = '1';
        break;
    }

    // Notify mode change
    if (this.onModeChange) {
      this.onModeChange(mode);
    }
  },

  /**
   * Get current mode
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  },

  /**
   * Update filename display
   * @param {string} filename
   */
  setFilename(filename) {
    if (this.filenameSpan) {
      this.filenameSpan.textContent = filename;
    }
  },

  /**
   * Register mode change callback
   * @param {Function} callback
   */
  onModeChange: null,
};

// Expose to window
window.Toolbar = Toolbar;
