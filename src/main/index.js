/**
 * Main process entry point
 * Initializes the Electron application
 */

const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

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

const pendingOpenPaths = new Set();
let isAppInitialized = false;

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

  onShowPreferences: () => {
    const mainWindow = getMainWindow();
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ['OK'],
      title: 'Preferences',
      message: 'Preferences are coming soon.',
      detail: 'Markdown Viewer will support preferences in a future update.',
    });
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

  // Open any files queued before the window was ready
  flushPendingOpenFiles(mainWindow);

  logger.info('Application initialized successfully');
}

// App event handlers
app.whenReady().then(() => {
  logger.info('App is ready');

  configureAboutPanel();
  initializeApp();
  isAppInitialized = true;

  if (pendingOpenPaths.size === 0) {
    const [firstArg] = extractFilePathsFromArgs(getInitialArgv());
    if (firstArg) {
      queueFileToOpen(firstArg);
    }
  }
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
  } else {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      flushPendingOpenFiles(mainWindow);
    }
  }
});

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  logger.info(`macOS open-file event: ${filePath}`);
  queueFileToOpen(filePath);
});

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    logger.info('Second instance detected; focusing existing window');
    const mainWindow = getMainWindow() || BrowserWindow.getAllWindows()[0];

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }

    extractFilePathsFromArgs(commandLine).forEach((filePath) => {
      queueFileToOpen(filePath);
    });
  });
}

function queueFileToOpen(filePath) {
  if (!filePath) return;
  pendingOpenPaths.add(filePath);

  const mainWindow = getMainWindow();
  if (mainWindow) {
    flushPendingOpenFiles(mainWindow);
  } else if (isAppInitialized) {
    initializeApp();
  }
}

async function flushPendingOpenFiles(mainWindow) {
  if (!mainWindow) return;

  const files = Array.from(pendingOpenPaths.values());
  pendingOpenPaths.clear();

  for (const filePath of files) {
    try {
      await handleOpenFile(mainWindow, filePath);
    } catch (error) {
      logger.error(`Unable to open file ${filePath}:`, error);
    }
  }
}

function extractFilePathsFromArgs(args = []) {
  return (args || [])
    .filter((arg) => arg && !arg.startsWith('-'))
    .map((arg) => (arg.startsWith('file://') ? new URL(arg).pathname : arg))
    .filter((filePath) => {
      try {
        return fs.existsSync(filePath);
      } catch {
        return false;
      }
    });
}

function getInitialArgv() {
  const argv = process.argv.slice(process.defaultApp ? 2 : 1);
  return argv;
}

function configureAboutPanel() {
  if (process.platform !== 'darwin') {
    return;
  }

  app.setAboutPanelOptions({
    applicationName: APP_INFO.NAME,
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    credits: 'Markdown Viewer — crafted for macOS markdown editing.',
    authors: ['Markdown Viewer Contributors'],
  });
}
