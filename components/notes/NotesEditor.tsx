'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Star,
  Share,
  MoreVertical,
  Plus,
  Type,
  List,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image as ImageIcon,
  GripVertical
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

interface Block {
  id: string;
  type: string;
  content: any;
  position: number;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface NotesEditorProps {
  note: Note;
  currentUser: CurrentUser;
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void;
}

export function NotesEditor({ note, currentUser, onNoteUpdate }: NotesEditorProps) {
  const [title, setTitle] = useState(note.title || 'Untitled');
  const [icon, setIcon] = useState(note.icon || '📝');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showSlashCommand, setShowSlashCommand] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ x: 0, y: 0 });
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [localContent, setLocalContent] = useState<Record<string, any>>({});
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set());
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const updateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced update function
  const debouncedUpdate = useCallback((blockId: string, content: any, delay: number = 500) => {
    // Clear existing timeout for this block
    if (updateTimeouts.current[blockId]) {
      clearTimeout(updateTimeouts.current[blockId]);
    }

    // Set saving state
    setSavingBlocks(prev => new Set(prev).add(blockId));

    // Set new timeout
    updateTimeouts.current[blockId] = setTimeout(async () => {
      try {
        const response = await fetch(`/api/notes/${note.id}/blocks/${blockId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const updatedBlock = await response.json();
          setBlocks(prev => 
            prev.map(block => 
              block.id === blockId ? { ...block, content: updatedBlock.content } : block
            )
          );
        }
      } catch (error) {
        console.error('Error updating block:', error);
      } finally {
        // Remove saving state
        setSavingBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
        
        // Clean up timeout reference
        delete updateTimeouts.current[blockId];
      }
    }, delay);
  }, [note.id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    setTitle(note.title || 'Untitled');
    setIcon(note.icon || '📝');
    setLocalContent({});
    loadNoteBlocks();
  }, [note.id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const loadNoteBlocks = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}/blocks`);
      if (response.ok) {
        const noteBlocks = await response.json();
        setBlocks(noteBlocks);
        
        // Initialize local content state
        const initialContent: Record<string, any> = {};
        noteBlocks.forEach((block: Block) => {
          initialContent[block.id] = block.content;
        });
        setLocalContent(initialContent);
      }
    } catch (error) {
      console.error('Error loading note blocks:', error);
    }
  };

  // Handle clicking anywhere in the editor area to create a new block
  const handleEditorClick = (e: React.MouseEvent) => {
    // Don't interfere with clicks on input elements or buttons
    const target = e.target as Element;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || 
        target.closest('input') || target.closest('textarea') || target.closest('button')) {
      return;
    }

    // Only handle clicks in empty areas
    if (e.target === editorRef.current || target.classList.contains('editor-content')) {
      const rect = editorRef.current?.getBoundingClientRect();
      if (rect && editorRef.current) {
        const clickY = e.clientY - rect.top;
        
        // Find the best position to insert new block based on click position
        let insertPosition = blocks.length;
        
        // Look through existing blocks to find insertion point
        const blockElements = editorRef.current.querySelectorAll('[data-block-id]');
        for (let i = 0; i < blockElements.length; i++) {
          const blockRect = blockElements[i].getBoundingClientRect();
          const blockTop = blockRect.top - rect.top;
          const blockBottom = blockTop + blockRect.height;
          
          if (clickY < blockTop - 10) { // 10px margin
            insertPosition = i;
            break;
          } else if (clickY > blockBottom + 10) {
            insertPosition = i + 1;
          }
        }
        
        addNewBlock('TEXT', '', insertPosition);
      }
    }
  };

  const addNewBlock = async (type: string = 'TEXT', content: any = '', position?: number) => {
    const newPosition = position !== undefined ? position : blocks.length;
    
    try {
      const response = await fetch(`/api/notes/${note.id}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
          position: newPosition,
        }),
      });

      if (response.ok) {
        const newBlock = await response.json();
        setBlocks(prev => {
          const updated = [...prev, newBlock].sort((a, b) => a.position - b.position);
          return updated;
        });
        
        // Initialize local content for new block
        setLocalContent(prev => ({
          ...prev,
          [newBlock.id]: content
        }));
        
        setFocusedBlockId(newBlock.id);
        
        // Focus the new block after a short delay
        setTimeout(() => {
          const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"]`);
          if (blockElement) {
            const input = blockElement.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
            if (input) {
              input.focus();
              // Move cursor to end if it has content
              if (input.value) {
                input.setSelectionRange(input.value.length, input.value.length);
              }
            }
          }
        }, 150); // Slightly longer delay to ensure DOM is updated
        
        return newBlock;
      }
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const updateBlockContent = (blockId: string, content: any) => {
    // Update local state immediately for responsive UI
    setLocalContent(prev => ({
      ...prev,
      [blockId]: content
    }));
    
    // Debounce the API call
    debouncedUpdate(blockId, content);
  };

  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    // For immediate updates (like type changes), update both local and remote
    if (updates.type) {
      setBlocks(prev => 
        prev.map(block => 
          block.id === blockId ? { ...block, ...updates } : block
        )
      );
      
      if (updates.content !== undefined) {
        setLocalContent(prev => ({
          ...prev,
          [blockId]: updates.content
        }));
      }
    }

    try {
      const response = await fetch(`/api/notes/${note.id}/blocks/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedBlock = await response.json();
        setBlocks(prev => 
          prev.map(block => 
            block.id === blockId ? updatedBlock : block
          )
        );
        
        if (updatedBlock.content !== undefined) {
          setLocalContent(prev => ({
            ...prev,
            [blockId]: updatedBlock.content
          }));
        }
      } else {
        // Revert optimistic update on failure
        loadNoteBlocks();
      }
    } catch (error) {
      console.error('Error updating block:', error);
      // Revert optimistic update on failure
      loadNoteBlocks();
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const response = await fetch(`/api/notes/${note.id}/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlocks(prev => prev.filter(block => block.id !== blockId));
      }
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Debounce title updates
    if (updateTimeouts.current['title']) {
      clearTimeout(updateTimeouts.current['title']);
    }
    
    updateTimeouts.current['title'] = setTimeout(() => {
      onNoteUpdate(note.id, { title: newTitle });
      delete updateTimeouts.current['title'];
    }, 500);
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    onNoteUpdate(note.id, { icon: newIcon });
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const content = target.value;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const blockIndex = blocks.findIndex(b => b.id === blockId);
      addNewBlock('TEXT', '', blockIndex + 1);
    }

    if (e.key === 'Backspace' && content === '') {
      e.preventDefault();
      deleteBlock(blockId);
      
      // Focus previous block
      const blockIndex = blocks.findIndex(b => b.id === blockId);
      if (blockIndex > 0) {
        const prevBlock = blocks[blockIndex - 1];
        setFocusedBlockId(prevBlock.id);
        setTimeout(() => {
          const prevElement = document.querySelector(`[data-block-id="${prevBlock.id}"]`);
          if (prevElement) {
            const input = prevElement.querySelector('input, textarea') as HTMLElement;
            if (input) {
              input.focus();
              // Move cursor to end
              if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
                input.setSelectionRange(input.value.length, input.value.length);
              }
            }
          }
        }, 100);
      }
    }

    if (e.key === '/' && content === '') {
      e.preventDefault();
      setCurrentBlockId(blockId);
      setShowSlashCommand(true);
      setSelectedCommandIndex(0);
      
      // Get cursor position for slash command menu
      const rect = target.getBoundingClientRect();
      setSlashCommandPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
    }

    // Handle slash command navigation
    if (showSlashCommand && currentBlockId === blockId) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < blockCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : blockCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSlashCommand(blockCommands[selectedCommandIndex].type);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashCommand(false);
        setCurrentBlockId(null);
      }
    }
  };

  const handleSlashCommand = (type: string) => {
    if (currentBlockId) {
      updateBlock(currentBlockId, { type, content: '' });
      setShowSlashCommand(false);
      setCurrentBlockId(null);
      
      // Focus the updated block
      setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${currentBlockId}"]`);
        if (blockElement) {
          const input = blockElement.querySelector('input, textarea') as HTMLElement;
          if (input) {
            input.focus();
          }
        }
      }, 100);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const blockCommands = [
    { type: 'TEXT', icon: Type, label: 'Text', description: 'Just start writing with plain text.' },
    { type: 'HEADING_1', icon: Type, label: 'Heading 1', description: 'Big section heading.' },
    { type: 'HEADING_2', icon: Type, label: 'Heading 2', description: 'Medium section heading.' },
    { type: 'HEADING_3', icon: Type, label: 'Heading 3', description: 'Small section heading.' },
    { type: 'BULLET_LIST', icon: List, label: 'Bulleted list', description: 'Create a simple bulleted list.' },
    { type: 'NUMBERED_LIST', icon: List, label: 'Numbered list', description: 'Create a list with numbering.' },
    { type: 'TODO', icon: CheckSquare, label: 'To-do list', description: 'Track tasks with a to-do list.' },
    { type: 'QUOTE', icon: Quote, label: 'Quote', description: 'Capture a quote.' },
    { type: 'CODE', icon: Code, label: 'Code', description: 'Capture a code snippet.' },
    { type: 'DIVIDER', icon: Minus, label: 'Divider', description: 'Visually divide blocks.' },
  ];

  const renderBlock = (block: Block) => {
    // Get content from local state or fallback to block content
    const currentContent = localContent[block.id] !== undefined ? localContent[block.id] : block.content;
    const isHovered = hoveredBlockId === block.id;
    const isFocused = focusedBlockId === block.id;
    
    const handleTextareaResize = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(24, textarea.scrollHeight) + 'px';
    };
    
    const commonProps = {
      value: typeof currentContent === 'string' ? currentContent : (currentContent?.text || ''),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateBlockContent(block.id, e.target.value);
        if (e.target instanceof HTMLTextAreaElement) {
          handleTextareaResize(e.target);
        }
      },
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      onFocus: () => setFocusedBlockId(block.id),
      onBlur: () => {
        // Don't immediately clear focus to allow for menu interactions
        setTimeout(() => {
          if (focusedBlockId === block.id && !showSlashCommand) {
            setFocusedBlockId(null);
          }
        }, 200);
      },
      className: "w-full bg-transparent border-none outline-none resize-none focus:ring-0 placeholder-gray-400",
      placeholder: block.type === 'TEXT' ? "Type '/' for commands" : getPlaceholderForType(block.type),
    };

    const blockContent = (() => {
      switch (block.type) {
        case 'HEADING_1':
          return (
            <input
              {...commonProps}
              placeholder="Heading 1"
              className={cn(commonProps.className, "text-3xl font-bold py-1 leading-tight")}
            />
          );

        case 'HEADING_2':
          return (
            <input
              {...commonProps}
              placeholder="Heading 2"
              className={cn(commonProps.className, "text-2xl font-bold py-1 leading-tight")}
            />
          );

        case 'HEADING_3':
          return (
            <input
              {...commonProps}
              placeholder="Heading 3"
              className={cn(commonProps.className, "text-xl font-bold py-1 leading-tight")}
            />
          );

        case 'BULLET_LIST':
          return (
            <div className="flex items-start space-x-2">
              <span className="text-gray-400 mt-1 select-none text-sm">•</span>
              <textarea
                {...commonProps}
                placeholder="List item"
                className={cn(commonProps.className, "min-h-[24px] py-1 leading-relaxed")}
                rows={1}
                style={{ resize: 'none' }}
                ref={(textarea) => {
                  if (textarea) handleTextareaResize(textarea);
                }}
              />
            </div>
          );

        case 'NUMBERED_LIST':
          return (
            <div className="flex items-start space-x-2">
              <span className="text-gray-400 mt-1 select-none text-sm">1.</span>
              <textarea
                {...commonProps}
                placeholder="List item"
                className={cn(commonProps.className, "min-h-[24px] py-1 leading-relaxed")}
                rows={1}
                style={{ resize: 'none' }}
                ref={(textarea) => {
                  if (textarea) handleTextareaResize(textarea);
                }}
              />
            </div>
          );

        case 'TODO':
          return (
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={currentContent?.checked || false}
                onChange={(e) => 
                  updateBlockContent(block.id, { 
                    ...currentContent, 
                    checked: e.target.checked 
                  })
                }
                className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <textarea
                value={currentContent?.text || ''}
                onChange={(e) => {
                  updateBlockContent(block.id, { 
                    ...currentContent, 
                    text: e.target.value 
                  });
                  handleTextareaResize(e.target);
                }}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
                onFocus={() => setFocusedBlockId(block.id)}
                placeholder="To-do"
                className={cn(
                  commonProps.className, 
                  "min-h-[24px] py-1 leading-relaxed",
                  currentContent?.checked && "line-through text-muted-foreground"
                )}
                rows={1}
                style={{ resize: 'none' }}
                ref={(textarea) => {
                  if (textarea) handleTextareaResize(textarea);
                }}
              />
            </div>
          );

        case 'QUOTE':
          return (
            <div className="border-l-3 border-gray-300 pl-4">
              <textarea
                {...commonProps}
                placeholder="Quote"
                className={cn(commonProps.className, "italic text-muted-foreground min-h-[24px] py-1 leading-relaxed")}
                rows={1}
                style={{ resize: 'none' }}
                ref={(textarea) => {
                  if (textarea) handleTextareaResize(textarea);
                }}
              />
            </div>
          );

        case 'CODE':
          return (
            <div className="bg-muted rounded-md p-3 font-mono border border-border">
              <textarea
                {...commonProps}
                placeholder="Code"
                className={cn(commonProps.className, "font-mono text-sm min-h-[60px] bg-muted text-foreground")}
                rows={3}
                style={{ resize: 'none' }}
                ref={(textarea) => {
                  if (textarea) handleTextareaResize(textarea);
                }}
              />
            </div>
          );

        case 'DIVIDER':
          return (
            <div className="my-4 cursor-pointer group" onClick={() => setFocusedBlockId(block.id)}>
              <hr className="border-gray-300 group-hover:border-gray-400 transition-colors" />
            </div>
          );

        default:
          return (
            <textarea
              {...commonProps}
              className={cn(commonProps.className, "min-h-[24px] py-1 leading-relaxed")}
              rows={1}
              style={{ resize: 'none' }}
              ref={(textarea) => {
                if (textarea) handleTextareaResize(textarea);
              }}
            />
          );
      }
    })();

    return (
      <div 
        className={cn(
          "group relative min-h-[32px] rounded-sm transition-all duration-150",
          isFocused && "bg-blue-50/30",
          isHovered && !isFocused && "bg-gray-50"
        )}
        onMouseEnter={() => setHoveredBlockId(block.id)}
        onMouseLeave={() => setHoveredBlockId(null)}
      >
        {/* Block controls */}
        <div className={cn(
          "absolute left-0 top-0 flex items-center -ml-8 opacity-0 group-hover:opacity-100 transition-opacity",
          isFocused && "opacity-100"
        )}>
          <button
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
          <button
            className="p-1 hover:bg-gray-200 rounded transition-colors cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        
        {/* Block content */}
        <div className="pl-2 pr-2">
          {blockContent}
        </div>
      </div>
    );
  };

  const getPlaceholderForType = (type: string) => {
    switch (type) {
      case 'HEADING_1': return 'Heading 1';
      case 'HEADING_2': return 'Heading 2';
      case 'HEADING_3': return 'Heading 3';
      case 'BULLET_LIST': return 'List item';
      case 'NUMBERED_LIST': return 'List item';
      case 'TODO': return 'To-do';
      case 'QUOTE': return 'Quote';
      case 'CODE': return 'Code';
      default: return "Type '/' for commands";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Toolbar */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0 bg-background">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Last edited {formatDate(note.updatedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNoteUpdate(note.id, { isFavorite: !note.isFavorite })}
            className={cn(
              "text-muted-foreground hover:text-yellow-500",
              note.isFavorite && "text-yellow-500"
            )}
          >
            <Star className={cn("w-4 h-4", note.isFavorite && "fill-current")} />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Share className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Star className="w-4 h-4 mr-2" />
                {note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Content - Full height with proper scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden bg-background">
        <div 
          className="h-full overflow-y-auto"
          style={{ 
            maxHeight: '100%',
            minHeight: '100%'
          }}
        >
          <div 
            ref={editorRef} 
            className="max-w-4xl mx-auto px-8 lg:px-12 py-12 min-h-full editor-content cursor-text"
            onClick={handleEditorClick}
          >
            {/* Cover Image Placeholder */}
            {note.coverImage && (
              <div className="mb-8">
                <img 
                  src={note.coverImage} 
                  alt="Cover" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Title Section */}
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <button
                  onClick={() => setIcon(icon === '📝' ? '📄' : '📝')}
                  className="text-6xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors mr-4 flex-shrink-0"
                >
                  {icon}
                </button>
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <Input
                      ref={titleInputRef}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        handleTitleChange(e.target.value);
                      }}
                      onBlur={() => {
                        setIsEditingTitle(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingTitle(false);
                        }
                        if (e.key === 'Escape') {
                          setTitle(note.title || 'Untitled');
                          setIsEditingTitle(false);
                        }
                      }}
                      className="text-4xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus:ring-0 dark:text-white"
                      placeholder="Untitled"
                    />
                  ) : (
                    <h1
                      onClick={() => setIsEditingTitle(true)}
                      className="text-4xl font-bold text-foreground cursor-text hover:bg-muted/50 rounded px-2 py-1 -ml-2 break-words"
                    >
                      {title}
                    </h1>
                  )}
                </div>
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-1 pb-32 min-h-[400px]">
              {blocks.map((block) => (
                <div key={block.id} className="group relative" data-block-id={block.id}>
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      {renderBlock(block)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state for new notes */}
              {blocks.length === 0 && (
                <div 
                  className="text-muted-foreground py-4 cursor-text min-h-[200px] flex items-center justify-center"
                  onClick={() => addNewBlock('TEXT', '')}
                >
                  <div className="text-center">
                    <p className="text-lg">Click anywhere to start writing...</p>
                    <p className="text-sm mt-2">Type '/' for commands</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slash Command Menu */}
      {showSlashCommand && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowSlashCommand(false);
              setCurrentBlockId(null);
            }}
          />
          <div 
            className="fixed z-50 w-80 bg-card border border-border rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto"
            style={{
              left: Math.min(slashCommandPosition.x, window.innerWidth - 320),
              top: Math.min(slashCommandPosition.y, window.innerHeight - 300),
            }}
          >
            <div className="space-y-1">
              {blockCommands.map((command, index) => (
                <button
                  key={command.type}
                  onClick={() => handleSlashCommand(command.type)}
                  className={cn(
                    "w-full flex items-start p-3 text-left rounded-lg transition-colors focus:outline-none",
                    index === selectedCommandIndex 
                      ? "bg-blue-50 border border-blue-200" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <command.icon className="w-5 h-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{command.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{command.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
