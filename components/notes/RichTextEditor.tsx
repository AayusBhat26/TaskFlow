'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Table,
  Minus,
  Type,
  Palette,
  Plus,
  ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

interface Block {
  id: string;
  type: BlockType;
  content: any;
  position: number;
  parentId?: string;
}

type BlockType = 
  | 'TEXT'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'BULLET_LIST'
  | 'NUMBERED_LIST'
  | 'TODO'
  | 'QUOTE'
  | 'CODE'
  | 'TABLE'
  | 'DIVIDER'
  | 'IMAGE'
  | 'CALLOUT'
  | 'TOGGLE';

const blockTypes = [
  { type: 'TEXT', label: 'Text', icon: Type },
  { type: 'HEADING_1', label: 'Heading 1', icon: Type },
  { type: 'HEADING_2', label: 'Heading 2', icon: Type },
  { type: 'HEADING_3', label: 'Heading 3', icon: Type },
  { type: 'BULLET_LIST', label: 'Bullet List', icon: List },
  { type: 'NUMBERED_LIST', label: 'Numbered List', icon: ListOrdered },
  { type: 'TODO', label: 'To-do List', icon: List },
  { type: 'QUOTE', label: 'Quote', icon: Quote },
  { type: 'CODE', label: 'Code', icon: Code },
  { type: 'DIVIDER', label: 'Divider', icon: Minus },
  { type: 'CALLOUT', label: 'Callout', icon: Quote },
];

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...", 
  className = "",
  readOnly = false 
}: RichTextEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Initialize blocks from content
  useEffect(() => {
    try {
      if (content) {
        const parsedBlocks = JSON.parse(content);
        setBlocks(parsedBlocks);
      } else {
        // Start with one empty text block
        const initialBlock: Block = {
          id: `block_${Date.now()}`,
          type: 'TEXT',
          content: { text: '' },
          position: 0
        };
        setBlocks([initialBlock]);
      }
    } catch (error) {
      console.error('Failed to parse content:', error);
      const initialBlock: Block = {
        id: `block_${Date.now()}`,
        type: 'TEXT',
        content: { text: '' },
        position: 0
      };
      setBlocks([initialBlock]);
    }
  }, [content]);

  // Update content when blocks change
  useEffect(() => {
    onChange(JSON.stringify(blocks));
  }, [blocks, onChange]);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, []);

  const addBlock = useCallback((afterBlockId: string, type: BlockType = 'TEXT') => {
    const afterBlock = blocks.find(b => b.id === afterBlockId);
    if (!afterBlock) return;

    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type,
      content: getDefaultContent(type),
      position: afterBlock.position + 1,
      parentId: afterBlock.parentId
    };

    setBlocks(prev => {
      const updated = prev.map(block => 
        block.position > afterBlock.position 
          ? { ...block, position: block.position + 1 }
          : block
      );
      return [...updated, newBlock].sort((a, b) => a.position - b.position);
    });

    return newBlock.id;
  }, [blocks]);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    if (readOnly) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(blockId);
      // Focus the new block
      setTimeout(() => {
        const newElement = document.querySelector(`[data-block-id="${newBlockId}"] [contenteditable]`) as HTMLElement;
        newElement?.focus();
      }, 0);
    } else if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId);
      if (block && (!block.content.text || block.content.text === '')) {
        e.preventDefault();
        deleteBlock(blockId);
        // Focus previous block
        const prevBlock = blocks
          .filter(b => b.position < block.position)
          .sort((a, b) => b.position - a.position)[0];
        if (prevBlock) {
          setTimeout(() => {
            const prevElement = document.querySelector(`[data-block-id="${prevBlock.id}"] [contenteditable]`) as HTMLElement;
            prevElement?.focus();
          }, 0);
        }
      }
    } else if (e.key === '/' && !e.shiftKey) {
      const block = blocks.find(b => b.id === blockId);
      if (block && (!block.content.text || block.content.text === '')) {
        e.preventDefault();
        setSelectedBlockId(blockId);
        setShowBlockMenu(true);
        
        // Position menu
        const element = e.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        setMenuPosition({ x: rect.left, y: rect.bottom });
      }
    }
  }, [blocks, addBlock, deleteBlock, readOnly]);

  const handleBlockTypeSelect = useCallback((type: BlockType) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, { 
        type, 
        content: getDefaultContent(type) 
      });
    }
    setShowBlockMenu(false);
    setSelectedBlockId(null);
  }, [selectedBlockId, updateBlock]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="editor-content space-y-2">
        {blocks.map((block) => (
          <BlockComponent
            key={block.id}
            block={block}
            onUpdate={(updates) => updateBlock(block.id, updates)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Block Type Menu */}
      {showBlockMenu && (
        <div 
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-2 w-64"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div className="px-3 py-2 text-sm text-gray-500 border-b">
            Choose a block type
          </div>
          {blockTypes.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <button
                key={blockType.type}
                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                onClick={() => handleBlockTypeSelect(blockType.type as BlockType)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{blockType.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Click outside to close menu */}
      {showBlockMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowBlockMenu(false)}
        />
      )}
    </div>
  );
}

interface BlockComponentProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  readOnly: boolean;
}

function BlockComponent({ block, onUpdate, onKeyDown, readOnly }: BlockComponentProps) {
  const handleContentChange = (newContent: any) => {
    onUpdate({ content: newContent });
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'HEADING_1':
        return (
          <h1 
            className="text-3xl font-bold outline-none"
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
            onKeyDown={onKeyDown}
          >
            {block.content.text || ''}
          </h1>
        );

      case 'HEADING_2':
        return (
          <h2 
            className="text-2xl font-semibold outline-none"
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
            onKeyDown={onKeyDown}
          >
            {block.content.text || ''}
          </h2>
        );

      case 'HEADING_3':
        return (
          <h3 
            className="text-xl font-medium outline-none"
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
            onKeyDown={onKeyDown}
          >
            {block.content.text || ''}
          </h3>
        );

      case 'QUOTE':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic">
            <p 
              className="outline-none"
              contentEditable={!readOnly}
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
              onKeyDown={onKeyDown}
            >
              {block.content.text || ''}
            </p>
          </blockquote>
        );

      case 'CODE':
        return (
          <div className="bg-muted rounded-md p-3 font-mono">
            <pre 
              className="outline-none whitespace-pre-wrap"
              contentEditable={!readOnly}
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
              onKeyDown={onKeyDown}
            >
              {block.content.text || ''}
            </pre>
          </div>
        );

      case 'DIVIDER':
        return <hr className="border-gray-300 my-4" />;

      case 'BULLET_LIST':
        return (
          <ul className="list-disc list-inside">
            <li>
              <span 
                className="outline-none"
                contentEditable={!readOnly}
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
                onKeyDown={onKeyDown}
              >
                {block.content.text || ''}
              </span>
            </li>
          </ul>
        );

      case 'NUMBERED_LIST':
        return (
          <ol className="list-decimal list-inside">
            <li>
              <span 
                className="outline-none"
                contentEditable={!readOnly}
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
                onKeyDown={onKeyDown}
              >
                {block.content.text || ''}
              </span>
            </li>
          </ol>
        );

      case 'TODO':
        return (
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={block.content.checked || false}
              onChange={(e) => handleContentChange({ ...block.content, checked: e.target.checked })}
              disabled={readOnly}
              className="h-4 w-4"
            />
            <span 
              className={`outline-none ${block.content.checked ? 'line-through text-gray-500' : ''}`}
              contentEditable={!readOnly}
              suppressContentEditableWarning
              onBlur={(e) => handleContentChange({ ...block.content, text: e.currentTarget.textContent })}
              onKeyDown={onKeyDown}
            >
              {block.content.text || ''}
            </span>
          </div>
        );

      case 'CALLOUT':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 text-lg">💡</div>
              <div 
                className="outline-none flex-1"
                contentEditable={!readOnly}
                suppressContentEditableWarning
                onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
                onKeyDown={onKeyDown}
              >
                {block.content.text || ''}
              </div>
            </div>
          </div>
        );

      default: // TEXT
        return (
          <p 
            className="outline-none leading-relaxed"
            contentEditable={!readOnly}
            suppressContentEditableWarning
            onBlur={(e) => handleContentChange({ text: e.currentTarget.textContent })}
            onKeyDown={onKeyDown}
          >
            {block.content.text || ''}
          </p>
        );
    }
  };

  return (
    <div 
      data-block-id={block.id}
      className="block-component group relative"
    >
      {renderBlock()}
      
      {/* Block actions */}
      {!readOnly && (
        <div className="absolute left-0 top-0 -ml-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-6 h-6 bg-muted hover:bg-muted/80 rounded border border-border text-xs flex items-center justify-center">
            ⋮
          </button>
        </div>
      )}
    </div>
  );
}

function getDefaultContent(type: BlockType): any {
  switch (type) {
    case 'TODO':
      return { text: '', checked: false };
    case 'DIVIDER':
      return {};
    case 'CALLOUT':
      return { text: '', icon: '💡' };
    default:
      return { text: '' };
  }
}
