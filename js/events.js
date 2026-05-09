// ── events.js ─────────────────────────────────────────────────────
// Handles all cell-level DOM events:
//   • onCellFocus        — user clicks or tabs into a cell
//   • onCellBlur         — user leaves a cell
//   • onCellInput        — user types inside a cell
//   • onCellKeydown      — arrow/tab/enter/ctrl shortcuts
//   • onCellContextMenu  — right-click menu
// Also sets up the formula bar's own events.
// ──────────────────────────────────────────────────────────────────


// ── onCellFocus ───────────────────────────────────────────────────
// Called when any cell gains focus.
// Updates: active cell tracking, header highlight, toolbar, formula bar.
function onCellFocus(e) {
  const id  = e.target.id;
  const col = e.target.getAttribute('data-col');
  const row = e.target.getAttribute('data-row');

  // Remove highlight from previously active cell
  if (activeCell && activeCell !== id) {
    const prev = getCell(activeCell);
    if (prev) {
      prev.classList.remove('selected', 'editing');
      highlightHeaders(
        prev.getAttribute('data-col'),
        prev.getAttribute('data-row'),
        false
      );
    }
  }

  // Update global active cell
  activeCell = id;
  e.target.classList.add('selected', 'editing');
  highlightHeaders(col, row, true);

  // Update UI
  document.getElementById('cell-ref-box').textContent = id;
  syncToolbarToCell(id);
  updateStatus(id);

  // Move cursor to end of text
  const range = document.createRange();
  const sel   = window.getSelection();
  range.selectNodeContents(e.target);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}


// ── onCellBlur ────────────────────────────────────────────────────
// Called when a cell loses focus.
// Saves the current inner text to cellData.
function onCellBlur(e) {
  const id = e.target.id;
  if (!cellData[id]) cellData[id] = { ...DEFAULT_STYLE, text: '' };
  cellData[id].text = e.target.innerText.trim();
  e.target.classList.remove('editing');
}


// ── onCellInput ───────────────────────────────────────────────────
// Called on every keystroke inside a cell.
// Keeps cellData and the formula bar in sync while typing.
function onCellInput(e) {
  const id   = e.target.id;
  const text = e.target.innerText;

  if (!cellData[id]) cellData[id] = { ...DEFAULT_STYLE };
  cellData[id].text = text;

  // Mirror into formula bar
  document.getElementById('formula-input').value = text;
}


// ── onCellKeydown ─────────────────────────────────────────────────
// Handles navigation (arrows, Tab, Enter) and formatting shortcuts
// (Ctrl+B, Ctrl+I, Ctrl+U) while a cell is focused.
function onCellKeydown(e) {
  const col = e.target.getAttribute('data-col').charCodeAt(0) - 64;  // A→1
  const row = parseInt(e.target.getAttribute('data-row'));

  let nextCol = col;
  let nextRow = row;
  let shouldNav = false;

  switch (e.key) {
    case 'Enter':
      if (!e.shiftKey) {
        e.preventDefault();
        nextRow = Math.min(row + 1, ROWS);
        shouldNav = true;
      }
      break;

    case 'Tab':
      e.preventDefault();
      nextCol = e.shiftKey
        ? Math.max(col - 1, 1)
        : Math.min(col + 1, COLS);
      shouldNav = true;
      break;

    case 'ArrowUp':
      e.preventDefault();
      nextRow = Math.max(row - 1, 1);
      shouldNav = true;
      break;

    case 'ArrowDown':
      e.preventDefault();
      nextRow = Math.min(row + 1, ROWS);
      shouldNav = true;
      break;

    case 'ArrowLeft':
      // Only navigate if nothing is selected (don't interrupt text editing)
      if (window.getSelection().toString() === '') {
        e.preventDefault();
        nextCol = Math.max(col - 1, 1);
        shouldNav = true;
      }
      break;

    case 'ArrowRight':
      if (window.getSelection().toString() === '') {
        e.preventDefault();
        nextCol = Math.min(col + 1, COLS);
        shouldNav = true;
      }
      break;

    case 'Escape':
      e.target.blur();
      return;
  }

  // Ctrl / Cmd formatting shortcuts
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') { e.preventDefault(); toggleBold(); }
    if (e.key === 'i') { e.preventDefault(); toggleItalic(); }
    if (e.key === 'u') { e.preventDefault(); toggleUnderline(); }
  }

  // Move focus to the next cell
  if (shouldNav) {
    const nextId = cellId(nextCol, nextRow);
    const nextEl = getCell(nextId);
    if (nextEl) {
      nextEl.focus();
      nextEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}


// ── onCellContextMenu ─────────────────────────────────────────────
// Prevents the browser default menu and shows our custom context menu.
function onCellContextMenu(e) {
  e.preventDefault();

  const menu = document.getElementById('context-menu');
  menu.style.display = 'block';

  // Keep menu inside viewport
  const x = Math.min(e.clientX, window.innerWidth  - 200);
  const y = Math.min(e.clientY, window.innerHeight - 160);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}


// ── Formula Bar Events ────────────────────────────────────────────
// Typing in the formula bar updates the active cell live.
// Enter confirms; Escape returns focus to the cell.
function initFormulaBar() {
  const formulaInput = document.getElementById('formula-input');

  formulaInput.addEventListener('input', () => {
    if (!activeCell) return;
    const el   = getCell(activeCell);
    const text = formulaInput.value;
    if (!el) return;
    el.innerText = text;
    if (!cellData[activeCell]) cellData[activeCell] = { ...DEFAULT_STYLE };
    cellData[activeCell].text = text;
  });

  formulaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      getCell(activeCell)?.focus();
    }
    if (e.key === 'Escape') {
      formulaInput.blur();
    }
  });
}
