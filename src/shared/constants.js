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
};

// View Modes
const VIEW_MODES = {
  EDIT: 'edit',
  PREVIEW: 'preview',
  SPLIT: 'split',
};

// File Filters
const FILE_FILTERS = {
  MARKDOWN: {
    name: 'Markdown Files',
    extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn'],
  },
  ALL: {
    name: 'All Files',
    extensions: ['*'],
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
};
