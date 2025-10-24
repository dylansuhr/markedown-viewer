/**
 * Preload script - Secure bridge between main and renderer processes
 * Exposes a limited API to the renderer via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('../shared/constants');

// Expose protected methods that allow the renderer to use the IPC
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Request to save current file content
   * @param {string} content - The file content to save
   */
  saveFile: (content) => {
    ipcRenderer.send(IPC_CHANNELS.FILE_CONTENT, content);
  },

  /**
   * Request to save file with a new path
   * @param {string} content - The file content to save
   * @param {string} filePath - The file path to save to
   */
  saveFileAs: (content, filePath) => {
    ipcRenderer.send(IPC_CHANNELS.FILE_CONTENT_SAVE_AS, content, filePath);
  },

  /**
   * Listen for file opened event
   * @param {Function} callback - Called with (content, filename)
   */
  onFileOpened: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.FILE_OPENED, (_event, content, filename) => {
      callback(content, filename);
    });
  },

  /**
   * Listen for file-saved confirmation
   * @param {Function} callback - Called with (filePath, filename)
   */
  onFileSaved: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.FILE_SAVED, (_event, filePath, filename) => {
      callback(filePath, filename);
    });
  },

  /**
   * Listen for save file event
   * @param {Function} callback - Called when save is requested
   */
  onSaveFile: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SAVE_FILE, () => {
      callback();
    });
  },

  /**
   * Listen for save file as event
   * @param {Function} callback - Called with (filePath)
   */
  onSaveFileAs: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SAVE_FILE_AS, (_event, filePath) => {
      callback(filePath);
    });
  },

  /**
   * Update the native "document edited" indicator.
   * @param {boolean} isDirty
   */
  setDirtyState: (isDirty) => {
    ipcRenderer.send(IPC_CHANNELS.SET_DIRTY_STATE, isDirty);
  },

  /**
   * Request the main process to open a local file path (e.g., drag-and-drop).
   * @param {string} filePath
   */
  openPath: (filePath) => {
    ipcRenderer.send(IPC_CHANNELS.REQUEST_OPEN_PATH, filePath);
  },

  /**
   * Show error dialog from renderer
   * @param {Object} options - Error dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Error message
   * @param {string} options.detail - Detailed error text
   */
  showError: (options) => {
    ipcRenderer.send(IPC_CHANNELS.SHOW_ERROR, options);
  },

  /**
   * Listen for theme changes
   * @param {Function} callback - Called with (isDark)
   */
  onThemeChanged: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.THEME_CHANGED, (_event, isDark) =>
      callback(isDark)
    );
  },

  /**
   * Listen for view mode changes from menu
   * @param {Function} callback - Called with (mode)
   */
  onSetViewMode: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.SET_VIEW_MODE, (_event, mode) =>
      callback(mode)
    );
  },
});
