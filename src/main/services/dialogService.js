/**
 * System dialog service
 * Handles native file dialogs (open, save)
 */

const { dialog } = require('electron');
const { FILE_FILTERS } = require('../../shared/constants');
const logger = require('../utils/logger');

/**
 * Show open file dialog
 * @param {BrowserWindow} window - Parent window
 * @returns {Promise<string|null>} Selected file path or null
 */
async function showOpenDialog(window) {
  try {
    logger.info('Showing open file dialog');

    const result = await dialog.showOpenDialog(window, {
      properties: ['openFile'],
      filters: [
        FILE_FILTERS.MARKDOWN,
        FILE_FILTERS.TEXT,
        FILE_FILTERS.MARKUP,
        FILE_FILTERS.ALL,
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      logger.info('Open dialog canceled by user');
      return null;
    }

    const filePath = result.filePaths[0];
    logger.info(`File selected: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('Error showing open dialog:', error);
    throw error;
  }
}

/**
 * Show save file dialog
 * @param {BrowserWindow} window - Parent window
 * @param {string} defaultPath - Default filename
 * @returns {Promise<string|null>} Selected save path or null
 */
async function showSaveDialog(window, defaultPath = 'untitled.md') {
  try {
    logger.info('Showing save file dialog');

    const result = await dialog.showSaveDialog(window, {
      defaultPath,
      filters: [
        FILE_FILTERS.MARKDOWN,
        FILE_FILTERS.TEXT,
        FILE_FILTERS.MARKUP,
        FILE_FILTERS.ALL,
      ],
    });

    if (result.canceled || !result.filePath) {
      logger.info('Save dialog canceled by user');
      return null;
    }

    const filePath = result.filePath;
    logger.info(`Save path selected: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('Error showing save dialog:', error);
    throw error;
  }
}

module.exports = {
  showOpenDialog,
  showSaveDialog,
};
