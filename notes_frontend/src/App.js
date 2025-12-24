import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App is the single-page Notes application.
 * - Add, edit, delete notes entirely in browser
 * - Persist notes in localStorage
 * - Filter/search notes by title and content
 * - Accessible inputs and controls with keyboard support
 */
function App() {
  // Theme (light only default; keep toggle for accessibility contrast if needed)
  const [theme, setTheme] = useState('light');

  // Notes state: [{id, title, content, createdAt, updatedAt}]
  const [notes, setNotes] = useState([]);
  // Form state for creating a new note
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  // Search/filter
  const [query, setQuery] = useState('');
  // Inline editing map: id -> {title, content, isEditing}
  const [editing, setEditing] = useState({});

  // Persist notes in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('notes_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes_v1', JSON.stringify(notes));
  }, [notes]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'light' : 'light'));
  };

  // Derived filtered notes
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  // PUBLIC_INTERFACE
  function handleCreateNote(e) {
    e.preventDefault();
    const title = newTitle.trim();
    const content = newContent.trim();
    if (!title && !content) return;

    const now = new Date().toISOString();
    const note = {
      id: cryptoRandomId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setNewTitle('');
    setNewContent('');
  }

  // PUBLIC_INTERFACE
  function startEditing(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setEditing((prev) => ({
      ...prev,
      [id]: { isEditing: true, title: note.title, content: note.content },
    }));
  }

  // PUBLIC_INTERFACE
  function cancelEditing(id) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // PUBLIC_INTERFACE
  function saveEditing(id) {
    const edit = editing[id];
    if (!edit) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              title: edit.title.trim(),
              content: edit.content.trim(),
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
    cancelEditing(id);
  }

  // PUBLIC_INTERFACE
  function deleteNote(id) {
    const note = notes.find((n) => n.id === id);
    const titlePreview = note?.title ? `"${note.title}"` : 'this note';
    // Basic confirmation
    // eslint-disable-next-line no-restricted-globals
    const ok = window.confirm(`Delete ${titlePreview}? This cannot be undone.`);
    if (!ok) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    cancelEditing(id);
  }

  // Handlers for editing values
  function setEditTitle(id, value) {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], title: value },
    }));
  }
  function setEditContent(id, value) {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], content: value },
    }));
  }

  return (
    <div className="App notes-app">
      <header className="app-header">
        <div className="container">
          <div className="header-top">
            <h1 className="app-title">Simple Notes</h1>
            <button
              className="btn btn-ghost"
              onClick={toggleTheme}
              aria-label="Theme toggle"
              title="Theme toggle"
            >
              ☀️
            </button>
          </div>
          <p className="app-subtitle">
            A lightweight, frontend-only notes app. Your notes stay in this browser.
          </p>
          <form className="note-form" onSubmit={handleCreateNote} aria-label="Create note form">
            <div className="form-field">
              <label htmlFor="title-input" className="label">
                Title
              </label>
              <input
                id="title-input"
                className="input"
                type="text"
                placeholder="Note title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                aria-label="Note title"
              />
            </div>
            <div className="form-field">
              <label htmlFor="content-input" className="label">
                Content
              </label>
              <textarea
                id="content-input"
                className="textarea"
                placeholder="Write your note..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                aria-label="Note content"
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                aria-label="Add note"
                disabled={!newTitle.trim() && !newContent.trim()}
              >
                Add Note
              </button>
            </div>
          </form>

          <div className="filters" role="search">
            <label htmlFor="search-input" className="sr-only">
              Search notes
            </label>
            <input
              id="search-input"
              className="input search-input"
              type="text"
              placeholder="Search notes by title or content…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search notes"
            />
          </div>
        </div>
      </header>

      <main className="container">
        {notes.length === 0 ? (
          <EmptyState />
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            title="No matching notes"
            description="Try adjusting your search query."
          />
        ) : (
          <ul className="notes-grid" aria-label="Notes list">
            {filteredNotes.map((note) => {
              const isEditing = !!editing[note.id]?.isEditing;
              return (
                <li key={note.id} className="note-card" aria-label="Note card">
                  {!isEditing ? (
                    <article>
                      <h3 className="note-title">{note.title || 'Untitled'}</h3>
                      <p className="note-content">
                        {note.content || <span className="muted">No content</span>}
                      </p>
                      <div className="note-meta">
                        <time className="note-time" dateTime={note.updatedAt}>
                          Updated {formatRelative(note.updatedAt)}
                        </time>
                      </div>
                      <div className="note-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => startEditing(note.id)}
                          aria-label={`Edit note ${note.title || ''}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteNote(note.id)}
                          aria-label={`Delete note ${note.title || ''}`}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ) : (
                    <article>
                      <div className="form-field">
                        <label htmlFor={`edit-title-${note.id}`} className="label">
                          Title
                        </label>
                        <input
                          id={`edit-title-${note.id}`}
                          className="input"
                          type="text"
                          value={editing[note.id].title}
                          onChange={(e) => setEditTitle(note.id, e.target.value)}
                          aria-label="Edit note title"
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor={`edit-content-${note.id}`} className="label">
                          Content
                        </label>
                        <textarea
                          id={`edit-content-${note.id}`}
                          className="textarea"
                          rows={4}
                          value={editing[note.id].content}
                          onChange={(e) => setEditContent(note.id, e.target.value)}
                          aria-label="Edit note content"
                        />
                      </div>
                      <div className="note-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => saveEditing(note.id)}
                          aria-label="Save note"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => cancelEditing(note.id)}
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    </article>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p className="muted">Notes are stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * EmptyState shows a simple message when there are no notes
 */
function EmptyState({
  title = 'No notes yet',
  description = 'Start by adding a note using the form above.',
}) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-visual" aria-hidden="true">🗒️</div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-description">{description}</p>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * cryptoRandomId generates a simple random id string.
 */
function cryptoRandomId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * PUBLIC_INTERFACE
 * formatRelative returns a human-friendly "x time ago" string.
 */
function formatRelative(iso) {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  } catch {
    return '';
  }
}

export default App;
