/**
 * Main window management
 * Creates and configures the application's main window
 */

const { BrowserWindow } = require('electron');
const path = require('path');
const os = require('os');
const { WINDOW_CONFIG } = require('../../shared/constants');
const { restoreWindowState, trackWindow } = require('./windowState');
const logger = require('../utils/logger');
const { setMainWindow } = require('../ipc/handlers');

let mainWindow = null;

/**
 * Create the main application window
 * @returns {BrowserWindow} The created window
 */
function createMainWindow() {
  logger.info('Creating main window');

  const restoredState = restoreWindowState();

  const windowOptions = {
    width: restoredState.width ?? WINDOW_CONFIG.DEFAULT_WIDTH,
    height: restoredState.height ?? WINDOW_CONFIG.DEFAULT_HEIGHT,
    x: restoredState.x,
    y: restoredState.y,
    minWidth: WINDOW_CONFIG.MIN_WIDTH,
    minHeight: WINDOW_CONFIG.MIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/preload.js'),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable node integration for security
      spellcheck: true,
    },
    icon: path.join(__dirname, '../../../assets/icons/icon.png'),
    titleBarStyle: os.platform() === 'darwin' ? 'hiddenInset' : 'default',
  };

  if (os.platform() === 'darwin') {
    windowOptions.vibrancy = 'under-window';
    windowOptions.visualEffectState = 'active';
    windowOptions.trafficLightPosition = { x: 12, y: 16 };
  }

  mainWindow = new BrowserWindow(windowOptions);

  // Enable fullscreen support on macOS
  if (os.platform() === 'darwin') {
    mainWindow.setFullScreenable(true);
  }

  // Load the index.html
  const indexPath = path.join(__dirname, '../../renderer/index.html');
  mainWindow.loadFile(indexPath);

  // Open DevTools in development (double-guard for safety)
  const { app } = require('electron');
  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    mainWindow = null;
    setMainWindow(null);
  });

  trackWindow(mainWindow);
  setMainWindow(mainWindow);

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
