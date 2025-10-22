/**
 * Preview Component
 * Manages the markdown preview pane
 */

/* global MarkdownService */

const Preview = {
  element: null,

  /**
   * Initialize the preview
   */
  init() {
    this.element = document.getElementById('preview');
  },

  /**
   * Update preview with markdown content
   * @param {string} markdown - Markdown text to render
   */
  update(markdown) {
    if (this.element) {
      const html = MarkdownService.parseMarkdown(markdown);
      this.element.innerHTML = html;
    }
  },

  /**
   * Clear preview content
   */
  clear() {
    if (this.element) {
      this.element.innerHTML = '';
    }
  },
};

// Expose to window
window.Preview = Preview;
