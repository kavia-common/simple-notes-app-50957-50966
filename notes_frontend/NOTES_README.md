# Simple Notes - Frontend Only

A lightweight, single-page React app to add, edit, delete, and search notes. All data is stored in the browser via localStorage.

## How to run

1. From this folder:
   - npm install
   - npm start
2. Open http://localhost:3000

## Features

- Add new notes (title + content)
- Inline edit with Save/Cancel
- Delete with confirmation
- Client-side search by title and content
- localStorage persistence (survives page reloads)
- Accessible inputs and controls (labels, aria-labels, keyboard-friendly)
- Modern light theme style:
  - primary #3b82f6
  - secondary #64748b
  - success #06b6d4
  - error #EF4444
  - background #f9fafb
  - surface #ffffff
  - text #111827
  - subtle gradient accents

## Notes

- No backend. Everything runs in the browser.
- Data key in localStorage: `notes_v1`.
- To reset, clear site data or localStorage.
