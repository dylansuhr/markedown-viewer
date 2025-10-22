/**
 * Editor Component
 * Manages the markdown text editor
 */

const Editor = {
  element: null,

  /**
   * Initialize the editor
   */
  init() {
    this.element = document.getElementById('editor');
  },

  /**
   * Get current editor content
   * @returns {string}
   */
  getContent() {
    return this.element ? this.element.value : '';
  },

  /**
   * Set editor content
   * @param {string} content
   */
  setContent(content) {
    if (this.element) {
      this.element.value = content;
    }
  },

  /**
   * Register input event listener
   * @param {Function} callback
   */
  onInput(callback) {
    if (this.element) {
      this.element.addEventListener('input', callback);
    }
  },

  /**
   * Clear editor content
   */
  clear() {
    this.setContent('');
  },
};

// Expose to window
window.Editor = Editor;
