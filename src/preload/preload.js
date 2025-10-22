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
});
