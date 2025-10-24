/**
 * IPC event handlers
 * Handles communication from renderer process
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { IPC_CHANNELS } = require('../../shared/constants');
const fileService = require('../services/fileService');
const logger = require('../utils/logger');

let currentFile = null;
let mainWindowRef = null;
let handlersRegistered = false;

/**
 * Setup all IPC handlers
 * @param {BrowserWindow} mainWindow - The main window instance
 */
function setupIpcHandlers(mainWindow) {
  mainWindowRef = mainWindow;

  if (handlersRegistered) {
    return;
  }

  logger.info('Setting up IPC handlers');
  handlersRegistered = true;

  // Handle file content for save operation
  ipcMain.on(IPC_CHANNELS.FILE_CONTENT, async (event, content) => {
    try {
      logger.info(`FILE_CONTENT handler triggered`);
      logger.info(`  Content length: ${content?.length ?? 'undefined'}`);
      logger.info(`  Current file: ${currentFile ?? 'undefined'}`);

      if (!currentFile) {
        logger.error('FILE_CONTENT: No current file set');
        showSaveError(
          mainWindowRef,
          'No file to save. Please use "Save As" to create a new file.'
        );
        if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
        return;
      }

      if (content === undefined || content === null) {
        logger.error('FILE_CONTENT: content is missing');
        showSaveError(mainWindowRef, 'No content to save');
        if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
        return;
      }

      logger.info(`Saving file: ${currentFile}`);
      await fileService.writeFile(currentFile, content);
      logger.info(`File written successfully: ${currentFile}`);
      notifyFileSaved(currentFile);
    } catch (error) {
      logger.error('Error in FILE_CONTENT handler:', error);
      logger.error('Error stack:', error.stack);

      // Show user-facing error and keep dirty flag
      showSaveError(mainWindowRef, error.message);
      if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
    }
  });

  // Handle file content for save-as operation
  ipcMain.on(
    IPC_CHANNELS.FILE_CONTENT_SAVE_AS,
    async (_event, content, filePath) => {
      try {
        logger.info(`FILE_CONTENT_SAVE_AS handler triggered`);
        logger.info(`  Content length: ${content?.length ?? 'undefined'}`);
        logger.info(`  File path: ${filePath ?? 'undefined'}`);

        if (!filePath) {
          logger.error('FILE_CONTENT_SAVE_AS: filePath is missing');
          showSaveError(mainWindowRef, 'No file path provided');
          if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
          return;
        }

        if (content === undefined || content === null) {
          logger.error('FILE_CONTENT_SAVE_AS: content is missing');
          showSaveError(mainWindowRef, 'No content to save');
          if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
          return;
        }

        logger.info(`Saving file as: ${filePath}`);
        await fileService.writeFile(filePath, content);
        logger.info(`File written successfully: ${filePath}`);

        currentFile = filePath;
        notifyFileSaved(filePath);
      } catch (error) {
        logger.error('Error in FILE_CONTENT_SAVE_AS handler:', error);
        logger.error('Error stack:', error.stack);

        // Show user-facing error and keep dirty flag
        showSaveError(mainWindowRef, error.message);
        if (mainWindowRef) mainWindowRef.setDocumentEdited(true);
      }
    }
  );

  // Allow renderer to request native open-file for dropped files
  ipcMain.on(IPC_CHANNELS.REQUEST_OPEN_PATH, async (_event, filePath) => {
    if (!filePath) return;
    const targetWindow =
      mainWindowRef || BrowserWindow.fromWebContents(_event.sender);

    if (targetWindow) {
      await handleOpenFile(targetWindow, filePath);
    }
  });

  // Update the document edited indicator
  ipcMain.on(IPC_CHANNELS.SET_DIRTY_STATE, (_event, isDirty) => {
    if (mainWindowRef && !mainWindowRef.isDestroyed()) {
      mainWindowRef.setDocumentEdited(Boolean(isDirty));
    }
  });

  logger.info('IPC handlers set up successfully');
}

/**
 * Handle open file action
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {string} filePath - Path to file to open
 */
async function handleOpenFile(mainWindow, filePath) {
  try {
    logger.info(`handleOpenFile called with: ${filePath}`);
    const content = await fileService.readFile(filePath);
    const filename = fileService.getFilename(filePath);

    logger.info(`File read successfully, content length: ${content?.length}`);
    logger.info(`Sending FILE_OPENED event to renderer`);

    currentFile = filePath;
    setRepresentedFile(mainWindow, filePath);
    addRecentDocument(filePath);
    mainWindow.webContents.send(IPC_CHANNELS.FILE_OPENED, content, filename);
    mainWindow.setDocumentEdited(false);

    logger.info(`File opened successfully: ${filePath}`);
  } catch (error) {
    logger.error('Error opening file:', error);
    logger.error('Error stack:', error.stack);

    // Show user-facing error
    showOpenError(mainWindow, error.message);
  }
}

/**
 * Handle save file action
 * @param {BrowserWindow} mainWindow - The main window instance
 */
function handleSaveFile(mainWindow) {
  logger.info('Save file requested');
  mainWindow.webContents.send(IPC_CHANNELS.SAVE_FILE);
}

/**
 * Handle save as action
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {string} filePath - Path to save file to
 */
function handleSaveFileAs(mainWindow, filePath) {
  logger.info(`Save file as requested: ${filePath}`);
  mainWindow.webContents.send(IPC_CHANNELS.SAVE_FILE_AS, filePath);
}

/**
 * Get current file path
 * @returns {string|null}
 */
function getCurrentFile() {
  return currentFile;
}

/**
 * Set current file path
 * @param {string|null} filePath
 */
function setCurrentFile(filePath) {
  currentFile = filePath;
}

/**
 * Update the primary BrowserWindow reference.
 * @param {BrowserWindow|null} window
 */
function setMainWindow(window) {
  mainWindowRef = window;
}

function notifyFileSaved(filePath) {
  if (!mainWindowRef || mainWindowRef.isDestroyed()) return;

  const filename = fileService.getFilename(filePath);
  if (process.platform === 'darwin') {
    setRepresentedFile(mainWindowRef, filePath);
    mainWindowRef.setDocumentEdited(false);
  }

  mainWindowRef.webContents.send(IPC_CHANNELS.FILE_SAVED, filePath, filename);
}

function addRecentDocument(filePath) {
  if (process.platform === 'darwin') {
    app.addRecentDocument(filePath);
  }
}

function setRepresentedFile(window, filePath) {
  if (process.platform === 'darwin' && window && !window.isDestroyed()) {
    window.setRepresentedFilename(filePath);
  }
}

/**
 * Show user-facing save error dialog
 * @param {BrowserWindow} window - Parent window
 * @param {string} message - Error message
 */
function showSaveError(window, message) {
  if (!window || window.isDestroyed()) return;

  dialog.showMessageBox(window, {
    type: 'error',
    buttons: ['OK'],
    title: 'Save Failed',
    message: 'Unable to save file',
    detail:
      message ||
      'An unknown error occurred while saving the file. Please try again or choose a different location.',
  });
}

/**
 * Show user-facing open error dialog
 * @param {BrowserWindow} window - Parent window
 * @param {string} message - Error message
 */
function showOpenError(window, message) {
  if (!window || window.isDestroyed()) return;

  dialog.showMessageBox(window, {
    type: 'error',
    buttons: ['OK'],
    title: 'Open Failed',
    message: 'Unable to open file',
    detail:
      message ||
      'An unknown error occurred while opening the file. Please try again or choose a different file.',
  });
}

module.exports = {
  setupIpcHandlers,
  handleOpenFile,
  handleSaveFile,
  handleSaveFileAs,
  getCurrentFile,
  setCurrentFile,
  setMainWindow,
};
