const { ipcRenderer } = require('electron');

// Simple markdown parser
function parseMarkdown(text) {
  if (!text) return '<p>No preview available</p>';
  
  try {
    let html = text;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Blockquotes
    html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');
    
    // Lists
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap list items in ul/ol tags
    html = html.replace(/(<li>.*<\/li>\s*)+/g, function(match) {
      return '<ul>' + match + '</ul>';
    });
    
    // Paragraphs
    const lines = html.split('\n');
    const processedLines = [];
    let inBlock = false;
    
    for (let line of lines) {
      if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<blockquote') || 
          line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<hr')) {
        inBlock = true;
        processedLines.push(line);
      } else if (line.includes('</pre>') || line.includes('</ul>') || line.includes('</ol>')) {
        processedLines.push(line);
        inBlock = false;
      } else if (line.trim() && !inBlock) {
        processedLines.push('<p>' + line + '</p>');
      } else {
        processedLines.push(line);
      }
    }
    
    return processedLines.join('\n');
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return '<p>Error parsing markdown</p>';
  }
}

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const editBtn = document.getElementById('editBtn');
const previewBtn = document.getElementById('previewBtn');
const splitBtn = document.getElementById('splitBtn');
const editorPane = document.getElementById('editorPane');
const previewPane = document.getElementById('previewPane');
const filenameSpan = document.getElementById('filename');

let currentMode = 'edit';

function updatePreview() {
  const content = editor.value;
  if (preview) {
    preview.innerHTML = parseMarkdown(content);
  }
}

function setMode(mode) {
  currentMode = mode;
  
  // Remove active class from all buttons
  editBtn.classList.remove('active');
  previewBtn.classList.remove('active');
  splitBtn.classList.remove('active');
  
  // Reset panes
  editorPane.classList.remove('hidden');
  previewPane.classList.remove('hidden');
  
  switch(mode) {
    case 'edit':
      editBtn.classList.add('active');
      previewPane.classList.add('hidden');
      editorPane.style.flex = '1';
      break;
    case 'preview':
      previewBtn.classList.add('active');
      editorPane.classList.add('hidden');
      previewPane.style.flex = '1';
      updatePreview();
      break;
    case 'split':
      splitBtn.classList.add('active');
      editorPane.style.flex = '1';
      previewPane.style.flex = '1';
      updatePreview();
      break;
  }
}

// Event listeners
editBtn.addEventListener('click', () => setMode('edit'));
previewBtn.addEventListener('click', () => setMode('preview'));
splitBtn.addEventListener('click', () => setMode('split'));

editor.addEventListener('input', () => {
  if (currentMode === 'split') {
    updatePreview();
  }
});

// IPC listeners
ipcRenderer.on('file-opened', (event, content, filename) => {
  editor.value = content;
  filenameSpan.textContent = filename;
  updatePreview();
});

ipcRenderer.on('save-file', () => {
  ipcRenderer.send('file-content', editor.value);
});

ipcRenderer.on('save-file-as', (event, filePath) => {
  ipcRenderer.send('file-content-save-as', editor.value, filePath);
  const path = require('path');
  filenameSpan.textContent = path.basename(filePath);
});

// Initialize with default content preview
updatePreview();
