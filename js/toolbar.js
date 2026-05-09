// ── toolbar.js ────────────────────────────────────────────────────
// Wires up every toolbar control to the active cell's style.
// Each section handles one group of controls.
// ──────────────────────────────────────────────────────────────────


// ── Toggle helpers ────────────────────────────────────────────────
// These are also called from keyboard shortcuts in events.js.

function toggleBold() {
  if (!activeCell) return;
  const data = getOrCreateData(activeCell);
  applyAndSave(activeCell, { bold: !data.bold });
}

function toggleItalic() {
  if (!activeCell) return;
  const data = getOrCreateData(activeCell);
  applyAndSave(activeCell, { italic: !data.italic });
}

function toggleUnderline() {
  if (!activeCell) return;
  const data = getOrCreateData(activeCell);
  applyAndSave(activeCell, { underline: !data.underline });
}

function toggleStrike() {
  if (!activeCell) return;
  const data = getOrCreateData(activeCell);
  applyAndSave(activeCell, { strikethrough: !data.strikethrough });
}


// ── initToolbar() ─────────────────────────────────────────────────
// Attaches all event listeners to toolbar controls.
// Call once after the DOM is ready.
function initToolbar() {

  // ── Text style buttons
  document.getElementById('btn-bold').addEventListener('click',      toggleBold);
  document.getElementById('btn-italic').addEventListener('click',    toggleItalic);
  document.getElementById('btn-underline').addEventListener('click', toggleUnderline);
  document.getElementById('btn-strike').addEventListener('click',    toggleStrike);

  // ── Font family dropdown
  document.getElementById('font-family-select').addEventListener('change', (e) => {
    applyAndSave(activeCell, { fontFamily: e.target.value });
  });

  // ── Font size input
  document.getElementById('font-size-input').addEventListener('change', (e) => {
    const size = Math.max(8, Math.min(72, parseInt(e.target.value) || 12));
    e.target.value = size;
    applyAndSave(activeCell, { fontSize: size });
  });

  // ── Alignment buttons
  document.getElementById('btn-align-left').addEventListener('click', () => {
    applyAndSave(activeCell, { align: 'left' });
  });
  document.getElementById('btn-align-center').addEventListener('click', () => {
    applyAndSave(activeCell, { align: 'center' });
  });
  document.getElementById('btn-align-right').addEventListener('click', () => {
    applyAndSave(activeCell, { align: 'right' });
  });

  // ── Text color picker
  document.getElementById('text-color-input').addEventListener('input', (e) => {
    document.getElementById('text-color-swatch').style.background = e.target.value;
    applyAndSave(activeCell, { textColor: e.target.value });
  });

  // ── Background / fill color picker
  document.getElementById('bg-color-input').addEventListener('input', (e) => {
    document.getElementById('bg-color-swatch').style.background = e.target.value;
    applyAndSave(activeCell, { bgColor: e.target.value });
  });

  // ── Clear cell button
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (!activeCell) return;
    const el = getCell(activeCell);
    if (!el) return;
    el.innerText = '';
    cellData[activeCell] = { ...DEFAULT_STYLE, text: '' };
    applyStyleToCell(activeCell, DEFAULT_STYLE);
    document.getElementById('formula-input').value = '';
    showToast('Cell cleared');
  });
}


// ── initContextMenu() ─────────────────────────────────────────────
// Wires up the right-click context menu items.
function initContextMenu() {
  const menu = document.getElementById('context-menu');

  // Close menu on any click outside
  document.addEventListener('click', () => { menu.style.display = 'none'; });

  // Copy
  document.getElementById('ctx-copy').addEventListener('click', () => {
    if (!activeCell) return;
    clipboard = {
      text:  getCellData(activeCell).text,
      style: { ...getCellData(activeCell) },
    };
    showToast('Copied');
  });

  // Paste
  document.getElementById('ctx-paste').addEventListener('click', () => {
    if (!activeCell || !clipboard) return;
    const el = getCell(activeCell);
    el.innerText = clipboard.text;
    cellData[activeCell] = { ...clipboard.style, text: clipboard.text };
    applyStyleToCell(activeCell, cellData[activeCell]);
    document.getElementById('formula-input').value = clipboard.text;
    showToast('Pasted');
  });

  // Clear formatting only (keep text)
  document.getElementById('ctx-clear-style').addEventListener('click', () => {
    if (!activeCell) return;
    const text = getCellData(activeCell).text;
    cellData[activeCell] = { ...DEFAULT_STYLE, text };
    applyStyleToCell(activeCell, cellData[activeCell]);
    syncToolbarToCell(activeCell);
    showToast('Formatting cleared');
  });

  // Clear entire cell (text + style)
  document.getElementById('ctx-clear-cell').addEventListener('click', () => {
    if (!activeCell) return;
    const el = getCell(activeCell);
    el.innerText = '';
    cellData[activeCell] = { ...DEFAULT_STYLE, text: '' };
    applyStyleToCell(activeCell, DEFAULT_STYLE);
    document.getElementById('formula-input').value = '';
    showToast('Cell cleared');
  });
}
