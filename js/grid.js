// ── grid.js ───────────────────────────────────────────────────────
// Responsible for building the spreadsheet DOM on page load.
// Runs once — after this, cells are managed via events.js.
// ──────────────────────────────────────────────────────────────────

// Convert column number to letter: 1→A, 2→B … 26→Z
function colLetter(n) {
  return String.fromCharCode(64 + n);
}

// Build a cell ID string like "A1", "C12"
function cellId(col, row) {
  return `${colLetter(col)}${row}`;
}

// Shortcut to get a DOM element by cell id
function getCell(id) {
  return document.getElementById(id);
}

// ── buildGrid() ───────────────────────────────────────────────────
// Creates the full grid: column headers + all rows with their cells.
// Called once from index.html after scripts load.
function buildGrid() {
  const colHeaders = document.getElementById('col-headers');
  const gridBody   = document.getElementById('grid-body');

  // ── Corner cell (top-left, above row numbers)
  const corner = document.createElement('div');
  corner.className = 'col-header-corner';
  colHeaders.appendChild(corner);

  // ── Column header letters (A … Z)
  for (let c = 1; c <= COLS; c++) {
    const hdr = document.createElement('div');
    hdr.className = 'col-header';
    hdr.id        = `ch-${colLetter(c)}`;   // e.g. ch-A
    hdr.textContent = colLetter(c);
    colHeaders.appendChild(hdr);
  }

  // ── Rows
  for (let r = 1; r <= ROWS; r++) {
    const row = document.createElement('div');
    row.className = 'grid-row';

    // Row number cell on the left
    const rowNum = document.createElement('div');
    rowNum.className   = 'row-num';
    rowNum.id          = `rh-${r}`;         // e.g. rh-1
    rowNum.textContent = r;
    row.appendChild(rowNum);

    // Data cells
    for (let c = 1; c <= COLS; c++) {
      const id   = cellId(c, r);
      const cell = document.createElement('div');

      cell.className       = 'cell';
      cell.id              = id;
      cell.contentEditable = 'true';
      cell.setAttribute('data-col', colLetter(c));  // e.g. "A"
      cell.setAttribute('data-row', r);              // e.g. 1
      cell.setAttribute('spellcheck', 'false');

      // All cell events are wired in events.js
      cell.addEventListener('focus',        onCellFocus);
      cell.addEventListener('blur',         onCellBlur);
      cell.addEventListener('input',        onCellInput);
      cell.addEventListener('keydown',      onCellKeydown);
      cell.addEventListener('contextmenu',  onCellContextMenu);

      row.appendChild(cell);
    }

    gridBody.appendChild(row);
  }
}
