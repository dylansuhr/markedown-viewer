/**
 * File operations service
 * Handles reading and writing files to disk
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { handleFileError } = require('../utils/errorHandler');

/**
 * Read file content from disk
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File content
 */
async function readFile(filePath) {
  try {
    logger.info(`Reading file: ${filePath}`);
    const content = await fs.promises.readFile(filePath, 'utf8');
    logger.info(`Successfully read file: ${filePath}`);
    return content;
  } catch (error) {
    handleFileError(error, 'read');
    throw error;
  }
}

/**
 * Write file content to disk
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content) {
  try {
    logger.info(`Writing file: ${filePath}`);
    await fs.promises.writeFile(filePath, content, 'utf8');
    logger.info(`Successfully wrote file: ${filePath}`);
  } catch (error) {
    handleFileError(error, 'save');
    throw error;
  }
}

/**
 * Get filename from path
 * @param {string} filePath - Full file path
 * @returns {string} Just the filename
 */
function getFilename(filePath) {
  return path.basename(filePath);
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  readFile,
  writeFile,
  getFilename,
  fileExists,
};
