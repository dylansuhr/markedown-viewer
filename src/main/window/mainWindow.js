/**
 * Main window management
 * Creates and configures the application's main window
 */

const { BrowserWindow } = require('electron');
const path = require('path');
const { WINDOW_CONFIG } = require('../../shared/constants');
const logger = require('../utils/logger');

let mainWindow = null;

/**
 * Create the main application window
 * @returns {BrowserWindow} The created window
 */
function createMainWindow() {
  logger.info('Creating main window');

  mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.DEFAULT_WIDTH,
    height: WINDOW_CONFIG.DEFAULT_HEIGHT,
    minWidth: WINDOW_CONFIG.MIN_WIDTH,
    minHeight: WINDOW_CONFIG.MIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/preload.js'),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable node integration for security
    },
    icon: path.join(__dirname, '../../../assets/icons/icon.png'),
  });

  // Load the index.html
  const indexPath = path.join(__dirname, '../../renderer/index.html');
  mainWindow.loadFile(indexPath);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    mainWindow = null;
  });

  logger.info('Main window created successfully');
  return mainWindow;
}

/**
 * Get the main window instance
 * @returns {BrowserWindow|null}
 */
function getMainWindow() {
  return mainWindow;
}

/**
 * Close the main window
 */
function closeMainWindow() {
  if (mainWindow) {
    mainWindow.close();
  }
}

module.exports = {
  createMainWindow,
  getMainWindow,
  closeMainWindow,
};
