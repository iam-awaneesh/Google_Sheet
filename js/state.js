// ── state.js ──────────────────────────────────────────────────────
// Central state for the entire app.
// All other modules READ and WRITE through these objects/variables.
//
// Why one file?  So there is a single source of truth — no two files
// keep their own copies that can go out of sync.
// ──────────────────────────────────────────────────────────────────

// cellData[cellId] stores the content + formatting for each cell.
// Example entry:
//   cellData['B3'] = {
//     text:          'Hello',
//     fontFamily:    "'DM Mono', monospace",
//     fontSize:      14,
//     bold:          true,
//     italic:        false,
//     underline:     false,
//     strikethrough: false,
//     align:         'left',
//     textColor:     '#e2e6f0',
//     bgColor:       '#0f1117',
//   }
const cellData = {};

// ID of the cell that currently has focus, e.g. 'A1'
let activeCell = null;

// Clipboard holds the last copied cell's text + style object
let clipboard = null;
