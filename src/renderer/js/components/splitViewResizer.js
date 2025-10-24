/**
 * Split View Resizer Component
 * Handles resizable split view between editor and preview panes
 */

const SplitViewResizer = (() => {
  let divider = null;
  let editorPane = null;
  let previewPane = null;
  let isDragging = false;

  function init() {
    divider = document.getElementById('divider');
    editorPane = document.getElementById('editorPane');
    previewPane = document.getElementById('previewPane');

    if (!divider || !editorPane || !previewPane) {
      console.error('SplitViewResizer: Required elements not found');
      return;
    }

    setupListeners();
    restoreSplitRatio();
  }

  function setupListeners() {
    // Mouse drag support
    divider.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      resize(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        saveSplitRatio();
      }
    });

    // Keyboard support (ArrowLeft/Right) for accessibility
    divider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const container = editorPane.parentElement;
        const currentRatio = editorPane.offsetWidth / container.offsetWidth;
        const newRatio = Math.max(0.2, currentRatio - 0.05); // Move 5% left
        editorPane.style.flex = `0 0 ${newRatio * 100}%`;
        updateAriaValue(newRatio);
        saveSplitRatio();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const container = editorPane.parentElement;
        const currentRatio = editorPane.offsetWidth / container.offsetWidth;
        const newRatio = Math.min(0.8, currentRatio + 0.05); // Move 5% right
        editorPane.style.flex = `0 0 ${newRatio * 100}%`;
        updateAriaValue(newRatio);
        saveSplitRatio();
      }
    });
  }

  function resize(mouseX) {
    const container = editorPane.parentElement;
    const containerRect = container.getBoundingClientRect();
    const ratio = (mouseX - containerRect.left) / containerRect.width;

    // Clamp between 20% and 80%
    const clampedRatio = Math.max(0.2, Math.min(0.8, ratio));

    editorPane.style.flex = `0 0 ${clampedRatio * 100}%`;
    previewPane.style.flex = `1`;
    updateAriaValue(clampedRatio);
  }

  function updateAriaValue(ratio) {
    // Update ARIA value for screen readers (percentage of total width)
    const percentage = Math.round(ratio * 100);
    divider.setAttribute('aria-valuenow', percentage);
  }

  function saveSplitRatio() {
    const ratio = editorPane.offsetWidth / editorPane.parentElement.offsetWidth;
    localStorage.setItem('splitRatio', ratio.toString());
  }

  function restoreSplitRatio() {
    const savedRatio = localStorage.getItem('splitRatio');
    if (savedRatio) {
      editorPane.style.flex = `0 0 ${parseFloat(savedRatio) * 100}%`;
      previewPane.style.flex = `1`;
      updateAriaValue(parseFloat(savedRatio));
    }
  }

  return {
    init,
  };
})();

// Expose to window
window.SplitViewResizer = SplitViewResizer;
