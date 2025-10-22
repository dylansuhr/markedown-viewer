/**
 * IPC event handlers
 * Handles communication from renderer process
 */

const { ipcMain } = require('electron');
const { IPC_CHANNELS } = require('../../shared/constants');
const fileService = require('../services/fileService');
const logger = require('../utils/logger');

let currentFile = null;

/**
 * Setup all IPC handlers
 * @param {BrowserWindow} _mainWindow - The main window instance (unused but kept for API consistency)
 */
function setupIpcHandlers(_mainWindow) {
  logger.info('Setting up IPC handlers');

  // Handle file content for save operation
  ipcMain.on(IPC_CHANNELS.FILE_CONTENT, async (_event, content) => {
    try {
      if (currentFile) {
        logger.info(`Saving file: ${currentFile}`);
        await fileService.writeFile(currentFile, content);
      } else {
        logger.warn('Save requested but no current file set');
      }
    } catch (error) {
      logger.error('Error in FILE_CONTENT handler:', error);
    }
  });

  // Handle file content for save-as operation
  ipcMain.on(
    IPC_CHANNELS.FILE_CONTENT_SAVE_AS,
    async (_event, content, filePath) => {
      try {
        logger.info(`Saving file as: ${filePath}`);
        await fileService.writeFile(filePath, content);
        currentFile = filePath;
      } catch (error) {
        logger.error('Error in FILE_CONTENT_SAVE_AS handler:', error);
      }
    }
  );

  logger.info('IPC handlers set up successfully');
}

/**
 * Handle open file action
 * @param {BrowserWindow} mainWindow - The main window instance
 * @param {string} filePath - Path to file to open
 */
async function handleOpenFile(mainWindow, filePath) {
  try {
    const content = await fileService.readFile(filePath);
    const filename = fileService.getFilename(filePath);

    currentFile = filePath;
    mainWindow.webContents.send(IPC_CHANNELS.FILE_OPENED, content, filename);

    logger.info(`File opened successfully: ${filePath}`);
  } catch (error) {
    logger.error('Error opening file:', error);
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

module.exports = {
  setupIpcHandlers,
  handleOpenFile,
  handleSaveFile,
  handleSaveFileAs,
  getCurrentFile,
  setCurrentFile,
};
