'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  FileText,
  Star,
  Archive,
  Settings,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface NotesSidebarProps {
  notes: Note[];
  workspaces: Workspace[];
  currentUser: CurrentUser;
  selectedNote: Note | null;
  collapsed: boolean;
  onNoteSelect: (note: Note) => void;
  onNoteCreate: (noteData: Partial<Note>) => void;
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void;
  onNoteDelete: (noteId: string) => void;
  onToggleCollapse: () => void;
}

const colorMap = {
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-500',
  RED: 'bg-red-500',
  PURPLE: 'bg-purple-500',
  PINK: 'bg-pink-500',
  INDIGO: 'bg-indigo-500',
  GRAY: 'bg-gray-500',
  FUCHSIA: 'bg-fuchsia-500',
};

export function NotesSidebar({
  notes,
  workspaces,
  currentUser,
  selectedNote,
  collapsed,
  onNoteSelect,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  onToggleCollapse,
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recent: true,
    favorites: true,
    workspace: true,
  });

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    searchQuery === ''
  );

  const favoriteNotes = filteredNotes.filter(note => note.isFavorite);
  const recentNotes = filteredNotes.filter(note => !note.isFavorite);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateNote = () => {
    onNoteCreate({
      title: 'Untitled',
      icon: '📝',
      isPublic: false,
      isFavorite: false,
    });
  };

  const handleToggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    onNoteUpdate(note.id, { isFavorite: !note.isFavorite });
  };

  const handleDeleteNote = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      onNoteDelete(note.id);
    }
  };

  const NoteItem = ({ note, level = 0 }: { note: Note; level?: number }) => (
    <div
      className={cn(
        "group flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
        selectedNote?.id === note.id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
        level > 0 && "ml-4"
      )}
      onClick={() => onNoteSelect(note)}
      style={{ paddingLeft: `${8 + (level * 16)}px` }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <span className="text-lg mr-2 flex-shrink-0">
          {note.icon || '📝'}
        </span>
        <span className="font-medium text-sm truncate text-foreground">
          {note.title || 'Untitled'}
        </span>
      </div>
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-yellow-500"
          onClick={(e) => handleToggleFavorite(note, e)}
        >
          <Star className={cn("w-3 h-3", note.isFavorite && "fill-yellow-400 text-yellow-500")} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="w-4 h-4 mr-2" />
              {note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 dark:text-red-400"
              onClick={(e) => handleDeleteNote(note, e)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <div className="w-16 border-r border-border bg-muted/30 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateNote}
          className="mb-4 text-gray-500 hover:text-gray-700"
        >
          <Plus className="w-4 h-4" />
        </Button>

        <div className="space-y-2">
          {notes.slice(0, 5).map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              size="sm"
              onClick={() => onNoteSelect(note)}
              className={cn(
                "w-10 h-10 p-0 text-lg",
                selectedNote?.id === note.id && "bg-blue-100"
              )}
            >
              {note.icon || '📝'}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-muted-foreground mr-2" />
            <h1 className="text-lg font-semibold text-foreground">Notes</h1>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateNote}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Favorites */}
          {favoriteNotes.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('favorites')}
                className="flex items-center w-full text-left mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                {expandedSections.favorites ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                Favorites
              </button>
              {expandedSections.favorites && (
                <div className="space-y-1">
                  {favoriteNotes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent */}
          {recentNotes.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('recent')}
                className="flex items-center w-full text-left mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                {expandedSections.recent ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                Recent
              </button>
              {expandedSections.recent && (
                <div className="space-y-1">
                  {recentNotes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-foreground mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first note to get started'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreateNote}
                  size="sm"
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New Note
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.image || ''} alt={currentUser.name} />
            <AvatarFallback className="bg-blue-500 text-white font-semibold text-xs">
              {currentUser.name?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {currentUser.name || currentUser.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
