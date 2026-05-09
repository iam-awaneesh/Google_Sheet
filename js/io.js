// ── io.js ─────────────────────────────────────────────────────────
// Handles saving (Export) and loading (Import) of spreadsheet data.
//
// File format (version 2):
// {
//   "version": 2,
//   "cells": {
//     "A1": { text, fontFamily, fontSize, bold, italic, ... },
//     "B3": { ... }
//   }
// }
//
// Version 1 (old format from the original project) is also supported
// on import for backward compatibility.
// ──────────────────────────────────────────────────────────────────


// ── initIO() ──────────────────────────────────────────────────────
// Attaches click handlers to the Export and Import buttons.
// Call once after the DOM is ready.
function initIO() {
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importData);
}


// ── exportData ────────────────────────────────────────────────────
// Serializes cellData to JSON and triggers a browser download.
function exportData() {
  // Make sure the active cell's latest text is saved before exporting
  if (activeCell) {
    const el = getCell(activeCell);
    if (el) {
      if (!cellData[activeCell]) cellData[activeCell] = { ...DEFAULT_STYLE };
      cellData[activeCell].text = el.innerText.trim();
    }
  }

  const payload = { version: 2, cells: cellData };
  const json    = JSON.stringify(payload, null, 2);
  const blob    = new Blob([json], { type: 'application/json' });
  const url     = URL.createObjectURL(blob);

  // Use the editable file name from the top bar
  const fileName = document.getElementById('file-name').value.trim() || 'spreadsheet';

  const a = document.createElement('a');
  a.href     = url;
  a.download = `${fileName}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showToast('Exported successfully');
}


// ── importData ────────────────────────────────────────────────────
// Reads a JSON file chosen by the user and populates the grid.
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);

      // Support both v2 format ({ version, cells }) and old flat format
      const cells = parsed.version === 2 ? parsed.cells : parsed;

      Object.keys(cells).forEach(id => {
        const d = cells[id];

        // Normalize keys — old format used isBold, isItalic, isUnderline
        cellData[id] = {
          text:          d.text          || '',
          fontFamily:    d.fontFamily    || DEFAULT_STYLE.fontFamily,
          fontSize:      d.fontSize      || DEFAULT_STYLE.fontSize,
          bold:          d.bold          ?? (d.isBold      ?? false),
          italic:        d.italic        ?? (d.isItalic    ?? false),
          underline:     d.underline     ?? (d.isUnderline ?? false),
          strikethrough: d.strikethrough ?? false,
          align:         d.align         || DEFAULT_STYLE.align,
          textColor:     d.textColor     || DEFAULT_STYLE.textColor,
          bgColor:       d.bgColor       || DEFAULT_STYLE.bgColor,
        };

        // Update the DOM cell if it exists in the current grid
        const el = getCell(id);
        if (el) {
          el.innerText = cellData[id].text;
          applyStyleToCell(id, cellData[id]);
        }
      });

      showToast('Imported successfully');
    } catch {
      showToast('Import failed — invalid or corrupted file');
    }

    // Reset the file input so the same file can be re-imported if needed
    e.target.value = '';
  };

  reader.readAsText(file);
}
