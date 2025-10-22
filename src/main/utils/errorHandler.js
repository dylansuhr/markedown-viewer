/**
 * Global error handling utility
 */

const { dialog } = require('electron');
const logger = require('./logger');

/**
 * Show error dialog to user
 * @param {string} title - Error dialog title
 * @param {string} message - Error message
 */
function showErrorDialog(title, message) {
  dialog.showErrorBox(title, message);
}

/**
 * Handle file operation errors
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed (e.g., 'open', 'save')
 */
function handleFileError(error, operation) {
  logger.error(`File ${operation} failed:`, error);

  const userMessage = `Failed to ${operation} file: ${error.message}`;
  showErrorDialog(`File ${operation} Error`, userMessage);
}

/**
 * Handle general application errors
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
function handleAppError(error, context) {
  logger.error(`Application error in ${context}:`, error);

  const userMessage = `An error occurred: ${error.message}`;
  showErrorDialog('Application Error', userMessage);
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    showErrorDialog(
      'Unexpected Error',
      'An unexpected error occurred. The application may need to restart.'
    );
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', { reason, promise });
  });
}

module.exports = {
  showErrorDialog,
  handleFileError,
  handleAppError,
  setupGlobalErrorHandlers,
};
