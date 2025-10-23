/**
 * Menu builder
 * Constructs the application menu
 */

const { Menu, app, dialog } = require('electron');
const logger = require('../utils/logger');

/**
 * Build and set the application menu
 * @param {Object} handlers - Menu action handlers
 * @param {Function} handlers.onOpen - Open file handler
 * @param {Function} handlers.onSave - Save file handler
 * @param {Function} handlers.onSaveAs - Save as handler
 * @param {Function} [handlers.onShowPreferences] - Preferences handler
 */
function buildMenu(handlers) {
  logger.info('Building application menu');

  const template = [];

  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences…',
          accelerator: 'CmdOrCtrl+,',
          click: handlers.onShowPreferences || showDefaultPreferencesDialog,
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  template.push({
    label: 'File',
    submenu: [
      {
        label: 'Open…',
        accelerator: 'CmdOrCtrl+O',
        click: handlers.onOpen,
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: handlers.onSave,
      },
      {
        label: 'Save As…',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: handlers.onSaveAs,
      },
      { type: 'separator' },
      {
        role: 'recentdocuments',
        submenu: [{ role: 'clearrecentdocuments' }],
      },
      { type: 'separator' },
      process.platform === 'darwin'
        ? { role: 'close' }
        : {
            label: 'Exit',
            accelerator: 'Alt+F4',
            click: () => app.quit(),
          },
    ],
  });

  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'startSpeaking' },
      { role: 'stopSpeaking' },
    ],
  });

  template.push({
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
  });

  template.push({
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(process.platform === 'darwin'
        ? [{ type: 'separator' }, { role: 'front' }]
        : [{ role: 'close' }]),
    ],
  });

  template.push({
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://www.electronjs.org');
        },
      },
    ],
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  logger.info('Application menu built successfully');
}

function showDefaultPreferencesDialog() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Preferences',
    message: 'Preferences are not yet configurable.',
    detail:
      'Add preference options in the future to customize Markdown Viewer.',
  });
}

module.exports = {
  buildMenu,
};
