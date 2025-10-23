/**
 * Markdown service
 * Handles parsing markdown to HTML using marked.js
 */

/* global marked */

marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: false, // Don't convert \n to <br>
  headerIds: true,
  mangle: false,
});

/**
 * Parse markdown text to HTML
 * @param {string} markdown - The markdown text
 * @returns {string} HTML string
 */
function parseMarkdown(markdown) {
  if (!markdown || markdown.trim() === '') {
    return '<p>No preview available</p>';
  }

  try {
    return marked.parse(markdown);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return '<p>Error parsing markdown</p>';
  }
}

// Expose to window for use by other modules
window.MarkdownService = {
  parseMarkdown,
};
