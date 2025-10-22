/**
 * Menu builder
 * Constructs the application menu
 */

const { Menu, app } = require('electron');
const logger = require('../utils/logger');

/**
 * Build and set the application menu
 * @param {Object} handlers - Menu action handlers
 * @param {Function} handlers.onOpen - Open file handler
 * @param {Function} handlers.onSave - Save file handler
 * @param {Function} handlers.onSaveAs - Save as handler
 */
function buildMenu(handlers) {
  logger.info('Building application menu');

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: handlers.onOpen,
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: handlers.onSave,
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: handlers.onSaveAs,
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  logger.info('Application menu built successfully');
}

module.exports = {
  buildMenu,
};
