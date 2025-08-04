'use client';

import React, { useState, useEffect } from 'react';
import { NotesSidebar } from './NotesSidebar';
import { NotesEditor } from './NotesEditor';
import { NotesWelcome } from './NotesWelcome';

interface Note {
  id: string;
  title?: string | null;
  icon?: string | null;
  coverImage?: string | null;
  isPublic: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  workspaceId?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
  workspace?: {
    id: string;
    name: string;
    color: string;
  } | null;
  children: Array<{
    id: string;
    title?: string | null;
    icon?: string | null;
    position: number;
  }>;
  _count: {
    blocks: number;
    children: number;
  };
}

interface Workspace {
  id: string;
  name: string;
  color: string;
  image?: string | null;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface NotesAppProps {
  notes: Note[];
  workspaces: Workspace[];
  currentUser: CurrentUser;
}

export function NotesApp({ notes, workspaces, currentUser }: NotesAppProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>(notes);

  // Auto-select first note if available
  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteCreate = async (noteData: Partial<Note>) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      setAllNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleNoteUpdate = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setAllNotes(prev => 
        prev.map(note => note.id === noteId ? updatedNote : note)
      );
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleNoteDelete = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setAllNotes(prev => prev.filter(note => note.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(allNotes.length > 1 ? allNotes[0] : null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <NotesSidebar
        notes={allNotes}
        workspaces={workspaces}
        currentUser={currentUser}
        selectedNote={selectedNote}
        collapsed={sidebarCollapsed}
        onNoteSelect={handleNoteSelect}
        onNoteCreate={handleNoteCreate}
        onNoteUpdate={handleNoteUpdate}
        onNoteDelete={handleNoteDelete}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {selectedNote ? (
          <NotesEditor
            note={selectedNote}
            currentUser={currentUser}
            onNoteUpdate={handleNoteUpdate}
          />
        ) : (
          <NotesWelcome
            currentUser={currentUser}
            onCreateNote={handleNoteCreate}
          />
        )}
      </div>
    </div>
  );
}
