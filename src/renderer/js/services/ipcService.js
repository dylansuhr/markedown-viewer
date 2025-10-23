/**
 * IPC Service
 * Wrapper for Electron IPC communication via preload script
 */

/* global electronAPI */

/**
 * Save file content
 * @param {string} content - Content to save
 */
function saveFile(content) {
  electronAPI.saveFile(content);
}

/**
 * Save file with new path
 * @param {string} content - Content to save
 * @param {string} filePath - Path to save to
 */
function saveFileAs(content, filePath) {
  electronAPI.saveFileAs(content, filePath);
}

/**
 * Register callback for file opened event
 * @param {Function} callback - Called with (content, filename)
 */
function onFileOpened(callback) {
  electronAPI.onFileOpened(callback);
}

/**
 * Register callback for save file event
 * @param {Function} callback - Called when save is requested
 */
function onSaveFile(callback) {
  electronAPI.onSaveFile(callback);
}

/**
 * Register callback for save file as event
 * @param {Function} callback - Called with (filePath)
 */
function onSaveFileAs(callback) {
  electronAPI.onSaveFileAs(callback);
}

/**
 * Register callback for file saved confirmation
 * @param {Function} callback - Called with (filePath, filename)
 */
function onFileSaved(callback) {
  electronAPI.onFileSaved(callback);
}

/**
 * Update dirty state indicator
 * @param {boolean} isDirty
 */
function setDirtyState(isDirty) {
  electronAPI.setDirtyState(isDirty);
}

/**
 * Ask main process to open a specific path (drag-and-drop)
 * @param {string} filePath
 */
function openPath(filePath) {
  electronAPI.openPath(filePath);
}

// Expose to window for use by other modules
window.IPCService = {
  saveFile,
  saveFileAs,
  onFileOpened,
  onSaveFile,
  onSaveFileAs,
  onFileSaved,
  setDirtyState,
  openPath,
};
