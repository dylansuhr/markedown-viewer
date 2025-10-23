/**
 * Window state persistence helper for macOS-friendly UX.
 * Persists the BrowserWindow size/position between sessions.
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const STATE_FILE_NAME = 'window-state.json';
const DEFAULT_STATE = {
  width: 1200,
  height: 800,
};

function getStorePath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, STATE_FILE_NAME);
}

/**
 * Restore the last known window bounds.
 * @returns {{width:number,height:number,x?:number,y?:number}}
 */
function restoreWindowState() {
  const storePath = getStorePath();

  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const state = JSON.parse(raw);

    if (
      typeof state === 'object' &&
      state !== null &&
      typeof state.width === 'number' &&
      typeof state.height === 'number'
    ) {
      return {
        width: state.width,
        height: state.height,
        x: typeof state.x === 'number' ? state.x : undefined,
        y: typeof state.y === 'number' ? state.y : undefined,
      };
    }
  } catch {
    // Ignore corrupted or missing state; fall back to defaults.
  }

  return { ...DEFAULT_STATE };
}

/**
 * Persist the current window bounds to disk.
 * @param {BrowserWindow} window
 */
function saveWindowState(window) {
  if (!window || window.isDestroyed()) return;

  const bounds = window.getBounds();
  const state = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
  };

  try {
    const storePath = getStorePath();
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Swallow persistence errors; not critical for runtime behavior.
  }
}

/**
 * Begin tracking a window so its bounds get saved on move/resize.
 * @param {BrowserWindow} window
 */
function trackWindow(window) {
  if (!window) return;

  const persist = () => saveWindowState(window);

  window.on('resize', persist);
  window.on('move', persist);
  window.on('close', persist);
}

module.exports = {
  restoreWindowState,
  trackWindow,
};
