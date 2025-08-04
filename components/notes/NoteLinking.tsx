'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, ExternalLink, Hash, Search, ArrowRight } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  icon?: string;
}

interface NoteLinkProps {
  onInsertLink: (noteId: string, noteTitle: string) => void;
  onClose: () => void;
  currentNoteId?: string;
  existingNotes: Note[];
}

interface LinkedNote {
  id: string;
  title: string;
  icon?: string;
  linkType: 'internal' | 'external';
}

export function NoteLinkModal({ onInsertLink, onClose, currentNoteId, existingNotes }: NoteLinkProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = existingNotes
    .filter(note => note.id !== currentNoteId) // Don't show current note
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredNotes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredNotes[selectedIndex]) {
      e.preventDefault();
      const note = filteredNotes[selectedIndex];
      onInsertLink(note.id, note.title);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNoteSelect = (note: Note) => {
    onInsertLink(note.id, note.title);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Link to Note</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <button
                key={note.id}
                onClick={() => handleNoteSelect(note)}
                className={`w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="text-lg">
                  {note.icon || '📄'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{note.title}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchQuery ? 'No notes found matching your search' : 'No notes available to link'}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NoteLinksDisplayProps {
  noteId: string;
  links: LinkedNote[];
  backlinks: LinkedNote[];
  onNavigate: (noteId: string) => void;
}

export function NoteLinksDisplay({ noteId, links, backlinks, onNavigate }: NoteLinksDisplayProps) {
  const [showLinks, setShowLinks] = useState(true);
  const [showBacklinks, setShowBacklinks] = useState(true);

  if (links.length === 0 && backlinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="space-y-6">
        {/* Outgoing Links */}
        {links.length > 0 && (
          <div>
            <button
              onClick={() => setShowLinks(!showLinks)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Links ({links.length})</span>
              <div className={`transform transition-transform ${showLinks ? 'rotate-90' : ''}`}>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
            
            {showLinks && (
              <div className="mt-2 space-y-1">
                {links.map(link => (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{link.icon || '📄'}</span>
                      <span className="text-sm text-blue-600 group-hover:text-blue-800 group-hover:underline">
                        {link.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div>
            <button
              onClick={() => setShowBacklinks(!showBacklinks)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Hash className="h-4 w-4" />
              <span>Referenced by ({backlinks.length})</span>
              <div className={`transform transition-transform ${showBacklinks ? 'rotate-90' : ''}`}>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
            
            {showBacklinks && (
              <div className="mt-2 space-y-1">
                {backlinks.map(backlink => (
                  <button
                    key={backlink.id}
                    onClick={() => onNavigate(backlink.id)}
                    className="block w-full text-left p-2 rounded hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{backlink.icon || '📄'}</span>
                      <span className="text-sm text-gray-600 group-hover:text-gray-800 group-hover:underline">
                        {backlink.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for handling note links within rich text
export function useNoteLinking() {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 });

  const handleLinkShortcut = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K to open link modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      
      // Get cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setLinkPosition({ x: rect.left, y: rect.bottom });
        setShowLinkModal(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleLinkShortcut);
    return () => document.removeEventListener('keydown', handleLinkShortcut);
  }, []);

  return {
    showLinkModal,
    setShowLinkModal,
    linkPosition
  };
}

// Component for rendering note links within text
interface NoteLinkComponentProps {
  noteId: string;
  noteTitle: string;
  onClick: (noteId: string) => void;
  className?: string;
}

export function NoteLinkComponent({ noteId, noteTitle, onClick, className = '' }: NoteLinkComponentProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick(noteId);
      }}
      className={`text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`Navigate to: ${noteTitle}`}
    >
      {noteTitle}
    </button>
  );
}

// Utility function to parse note links from text content
export function parseNoteLinks(content: string): { text: string; links: { id: string; title: string; start: number; end: number }[] } {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links: { id: string; title: string; start: number; end: number }[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      id: match[1], // For now, using title as ID - should be mapped to actual note IDs
      title: match[1],
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return { text: content, links };
}
