/**
 * Main process entry point
 * Initializes the Electron application
 */

const { app, BrowserWindow } = require('electron');

// Import modules
const { createMainWindow, getMainWindow } = require('./window/mainWindow');
const { buildMenu } = require('./menu/menuBuilder');
const {
  setupIpcHandlers,
  handleOpenFile,
  handleSaveFile,
  handleSaveFileAs,
  getCurrentFile,
} = require('./ipc/handlers');
const dialogService = require('./services/dialogService');
const logger = require('./utils/logger');
const { setupGlobalErrorHandlers } = require('./utils/errorHandler');
const { APP_INFO } = require('../shared/constants');

// Setup global error handlers
setupGlobalErrorHandlers();

/**
 * Menu action handlers
 */
const menuHandlers = {
  onOpen: async () => {
    logger.info('Open file menu clicked');
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    const filePath = await dialogService.showOpenDialog(mainWindow);
    if (filePath) {
      await handleOpenFile(mainWindow, filePath);
    }
  },

  onSave: () => {
    logger.info('Save file menu clicked');
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    const currentFile = getCurrentFile();
    if (currentFile) {
      handleSaveFile(mainWindow);
    } else {
      menuHandlers.onSaveAs();
    }
  },

  onSaveAs: async () => {
    logger.info('Save as menu clicked');
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    const filePath = await dialogService.showSaveDialog(
      mainWindow,
      APP_INFO.UNTITLED_FILE
    );
    if (filePath) {
      handleSaveFileAs(mainWindow, filePath);
    }
  },
};

/**
 * Initialize the application
 */
function initializeApp() {
  logger.info('Initializing application');

  // Create main window
  const mainWindow = createMainWindow();

  // Setup IPC handlers
  setupIpcHandlers(mainWindow);

  // Build application menu
  buildMenu(menuHandlers);

  logger.info('Application initialized successfully');
}

// App event handlers
app.whenReady().then(() => {
  logger.info('App is ready');
  initializeApp();
});

app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  logger.info('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});
