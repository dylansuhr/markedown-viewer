/**
 * Shared constants used across main and renderer processes
 */

// IPC Channel Names
const IPC_CHANNELS = {
  // Main -> Renderer
  FILE_OPENED: 'file-opened',
  SAVE_FILE: 'save-file',
  SAVE_FILE_AS: 'save-file-as',
  FILE_SAVED: 'file-saved',

  // Renderer -> Main
  FILE_CONTENT: 'file-content',
  FILE_CONTENT_SAVE_AS: 'file-content-save-as',
  SET_DIRTY_STATE: 'set-dirty-state',
  REQUEST_OPEN_PATH: 'request-open-path',
  SHOW_ERROR: 'show-error',

  // Theme
  THEME_CHANGED: 'theme-changed',
};

// View Modes
const VIEW_MODES = {
  EDIT: 'edit',
  PREVIEW: 'preview',
  SPLIT: 'split',
};

// Supported UTIs (Uniform Type Identifiers) for macOS
const SUPPORTED_UTIS = {
  MARKDOWN: [
    'net.daringfireball.markdown', // Official markdown UTI
    'public.markdown', // Generic markdown
  ],
  TEXT: [
    'public.plain-text', // Plain text files
    'public.text', // Generic text
  ],
  MARKUP: [
    'public.html', // HTML files
    'public.json', // JSON files
  ],
  EXTENDED: [
    'io.typora.mdx', // MDX files
  ],
};

// Normalized extension list (for validation across all entry points)
const VALID_EXTENSIONS = [
  '.md',
  '.markdown',
  '.mdown',
  '.mkd',
  '.mkdn', // Standard markdown
  '.txt',
  '.text', // Plain text
  '.html',
  '.htm', // HTML
  '.json', // JSON
  '.mdx', // MDX
  '.rmd', // R Markdown
  '.adoc', // AsciiDoc
];

// File Filters (synchronized with VALID_EXTENSIONS)
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
    extensions: [
      'md',
      'markdown',
      'mdown',
      'mkd',
      'mkdn',
      'txt',
      'text',
      'html',
      'htm',
      'json',
      'mdx',
      'rmd',
      'adoc',
    ],
  },
};

// Window Configuration
const WINDOW_CONFIG = {
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 800,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
};

// Application Info
const APP_INFO = {
  NAME: 'Markdown Viewer',
  UNTITLED_FILE: 'untitled.md',
};

module.exports = {
  IPC_CHANNELS,
  VIEW_MODES,
  FILE_FILTERS,
  WINDOW_CONFIG,
  APP_INFO,
  SUPPORTED_UTIS,
  VALID_EXTENSIONS,
};
