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
 * Write file content to disk atomically
 * Uses temp file + rename for atomic writes within same volume
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content) {
  // Create temp file in same directory as target to ensure same volume
  // (rename is only atomic within the same filesystem)
  const targetDir = path.dirname(filePath);
  const targetName = path.basename(filePath);
  const tempFile = path.join(targetDir, `.${targetName}.tmp-${Date.now()}`);

  try {
    logger.info(`Writing file: ${filePath}`);

    try {
      // Write content to temp file
      await fs.promises.writeFile(tempFile, content, 'utf8');
      logger.info(`Temp file written: ${tempFile}`);

      // Atomic move: rename temp file to target (atomic within same volume)
      await fs.promises.rename(tempFile, filePath);
      logger.info(`Successfully wrote file: ${filePath}`);
    } catch (renameError) {
      // Handle cross-volume scenario (EXDEV error)
      if (renameError.code === 'EXDEV') {
        logger.warn(
          'Cross-volume rename detected, falling back to copy + fsync'
        );

        // Copy content to destination
        await fs.promises.copyFile(tempFile, filePath);

        // Ensure data is flushed to disk
        const fd = await fs.promises.open(filePath, 'r+');
        await fd.sync(); // fsync
        await fd.close();

        logger.info(`Successfully wrote file (cross-volume): ${filePath}`);
      } else {
        throw renameError;
      }
    }
  } catch (error) {
    logger.error(`Failed to write file ${filePath}:`, error);
    handleFileError(error, 'save');
    throw error;
  } finally {
    // Clean up temp file in all failure paths (ignore errors if already deleted)
    await fs.promises.unlink(tempFile).catch(() => {});
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
