// ── style.js ──────────────────────────────────────────────────────
// All functions that read or write visual style:
//   • applyStyleToCell  — writes a style object to a DOM cell
//   • syncToolbarToCell — updates toolbar controls to match the
//                         active cell's stored style
//   • highlightHeaders  — lights up the column letter + row number
//   • updateStatus      — refreshes the bottom status bar
// ──────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────

// Return the stored data for a cell, or a fresh copy of DEFAULT_STYLE
function getCellData(id) {
  return cellData[id] || { text: '', ...DEFAULT_STYLE };
}

// Return (and create if missing) the mutable data object for a cell
function getOrCreateData(id) {
  if (!cellData[id]) {
    cellData[id] = { ...DEFAULT_STYLE, text: '' };
  }
  return cellData[id];
}

// Show a brief toast message at the bottom of the screen
function showToast(msg, duration = 2000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}


// ── applyStyleToCell ──────────────────────────────────────────────
// Write all properties from a style object into a cell's inline CSS.
function applyStyleToCell(id, style) {
  const el = getCell(id);
  if (!el) return;

  el.style.fontFamily  = style.fontFamily;
  el.style.fontSize    = style.fontSize + 'px';
  el.style.fontWeight  = style.bold   ? '700'    : '400';
  el.style.fontStyle   = style.italic ? 'italic' : 'normal';

  // Build text-decoration from underline + strikethrough flags
  const decorations = [
    style.underline      ? 'underline'    : '',
    style.strikethrough  ? 'line-through' : '',
  ].filter(Boolean).join(' ');
  el.style.textDecoration = decorations || 'none';

  el.style.textAlign       = style.align;
  el.style.color           = style.textColor;
  el.style.backgroundColor = style.bgColor;
}


// ── syncToolbarToCell ─────────────────────────────────────────────
// Reads the stored style for `id` and updates every toolbar control
// so it reflects the active cell.
function syncToolbarToCell(id) {
  const data = getCellData(id);

  // Font controls
  document.getElementById('font-family-select').value = data.fontFamily;
  document.getElementById('font-size-input').value    = data.fontSize;

  // Toggle buttons — add/remove .active class
  document.getElementById('btn-bold').classList.toggle('active',      data.bold);
  document.getElementById('btn-italic').classList.toggle('active',    data.italic);
  document.getElementById('btn-underline').classList.toggle('active', data.underline);
  document.getElementById('btn-strike').classList.toggle('active',    data.strikethrough);

  // Alignment buttons
  document.getElementById('btn-align-left').classList.toggle('active',   data.align === 'left');
  document.getElementById('btn-align-center').classList.toggle('active', data.align === 'center');
  document.getElementById('btn-align-right').classList.toggle('active',  data.align === 'right');

  // Color pickers + swatches
  document.getElementById('text-color-input').value          = data.textColor;
  document.getElementById('bg-color-input').value            = data.bgColor;
  document.getElementById('text-color-swatch').style.background = data.textColor;
  document.getElementById('bg-color-swatch').style.background   = data.bgColor;

  // Formula bar
  document.getElementById('formula-input').value = data.text || '';
}


// ── highlightHeaders ──────────────────────────────────────────────
// Turn on/off the accent highlight on the column letter and row number
// that correspond to the active cell.
function highlightHeaders(col, row, on) {
  const colEl = document.getElementById(`ch-${col}`);
  const rowEl = document.getElementById(`rh-${row}`);
  if (colEl) colEl.classList.toggle('highlighted', on);
  if (rowEl) rowEl.classList.toggle('highlighted', on);
}


// ── updateStatus ──────────────────────────────────────────────────
// Refreshes the bottom status bar: cell reference, column Sum & Count.
function updateStatus(id) {
  const el = getCell(id);
  if (!el) return;

  const col = el.getAttribute('data-col');           // e.g. "B"
  const colIndex = col.charCodeAt(0) - 64;           // "B" → 2

  document.getElementById('status-cell').innerHTML = `Cell: <span>${id}</span>`;

  // Calculate sum and count for all numeric values in this column
  let sum = 0, count = 0;
  for (let r = 1; r <= ROWS; r++) {
    const val = getCellData(cellId(colIndex, r)).text;
    const num = parseFloat(val);
    if (!isNaN(num)) { sum += num; count++; }
  }

  const sumDisplay = count
    ? sum.toFixed(sum % 1 === 0 ? 0 : 2)
    : '—';

  document.getElementById('status-sum').innerHTML   = `Sum: <span>${sumDisplay}</span>`;
  document.getElementById('status-count').innerHTML = `Count: <span>${count || '—'}</span>`;
}


// ── applyAndSave ──────────────────────────────────────────────────
// Merge a partial style `patch` into the active cell's data,
// then re-render the cell and sync the toolbar.
function applyAndSave(id, patch) {
  if (!id) return;
  const data = getOrCreateData(id);
  Object.assign(data, patch);
  applyStyleToCell(id, data);
  syncToolbarToCell(id);
}
