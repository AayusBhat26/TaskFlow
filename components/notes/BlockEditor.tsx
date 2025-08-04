'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Code,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Block {
  id: string;
  type: string;
  content: any;
  position: number;
}

interface BlockEditorProps {
  block: Block;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onNewBlock: () => void;
  isLast: boolean;
}

export function BlockEditor({ block, onUpdate, onDelete, onNewBlock, isLast }: BlockEditorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState(block.content || '');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setContent(block.content || '');
  }, [block.content]);

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    onUpdate(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type === 'TEXT' || block.type.startsWith('HEADING')) {
        e.preventDefault();
        onNewBlock();
      }
    }
    if (e.key === 'Backspace' && content === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'HEADING_1':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Heading 1"
            className="text-3xl font-bold border-none shadow-none p-0 h-auto bg-transparent placeholder-gray-400"
          />
        );

      case 'HEADING_2':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Heading 2"
            className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent placeholder-gray-400"
          />
        );

      case 'HEADING_3':
        return (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Heading 3"
            className="text-xl font-bold border-none shadow-none p-0 h-auto bg-transparent placeholder-gray-400"
          />
        );

      case 'BULLET_LIST':
        return (
          <div className="flex items-start space-x-2">
            <span className="text-muted-foreground mt-1">•</span>
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="List item"
              className="border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 min-h-[24px]"
              rows={1}
            />
          </div>
        );

      case 'NUMBERED_LIST':
        return (
          <div className="flex items-start space-x-2">
            <span className="text-muted-foreground mt-1">1.</span>
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="List item"
              className="border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 min-h-[24px]"
              rows={1}
            />
          </div>
        );

      case 'TODO':
        return (
          <div className="flex items-start space-x-2">
            <Checkbox
              checked={content?.checked || false}
              onCheckedChange={(checked) => 
                handleContentChange({ ...content, checked })
              }
              className="mt-1"
            />
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={content?.text || ''}
              onChange={(e) => 
                handleContentChange({ ...content, text: e.target.value })
              }
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="To-do"
              className={cn(
                "border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 min-h-[24px]",
                content?.checked && "line-through text-muted-foreground"
              )}
              rows={1}
            />
          </div>
        );

      case 'QUOTE':
        return (
          <div className="border-l-4 border-gray-300 pl-4">
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Quote"
              className="border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 italic text-gray-700 min-h-[24px]"
              rows={1}
            />
          </div>
        );

      case 'CODE':
        return (
          <div className="bg-gray-100 rounded-lg p-4 font-mono">
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Code"
              className="border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 font-mono text-sm min-h-[24px]"
              rows={3}
            />
          </div>
        );

      case 'DIVIDER':
        return (
          <div className="my-6">
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type '/' for commands"
            className="border-none shadow-none p-0 resize-none bg-transparent placeholder-gray-400 min-h-[24px]"
            rows={1}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start space-x-2 py-1 px-2 rounded-lg transition-colors",
        isHovered && "bg-gray-50",
        isFocused && "bg-blue-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle and Controls */}
      <div className={cn(
        "flex items-center space-x-1 opacity-0 transition-opacity",
        (isHovered || isFocused) && "opacity-100"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 cursor-grab"
        >
          <GripVertical className="w-3 h-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNewBlock}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <Plus className="w-3 h-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem>
              <Bold className="w-4 h-4 mr-2" />
              Bold
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Italic className="w-4 h-4 mr-2" />
              Italic
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Underline className="w-4 h-4 mr-2" />
              Underline
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Code className="w-4 h-4 mr-2" />
              Inline code
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="w-4 h-4 mr-2" />
              Link
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block Content */}
      <div className="flex-1 min-w-0">
        {renderBlockContent()}
      </div>
    </div>
  );
}
