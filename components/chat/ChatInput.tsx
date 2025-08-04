'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send,
  Smile,
  Paperclip,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/context/SocketProvider';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface ChatInputProps {
  workspaceId: string;
  currentUser: CurrentUser;
}

export function ChatInput({ workspaceId, currentUser }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { socket } = useSocket();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || !workspaceId) return;

    try {
      setIsSending(true);
      
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: trimmedMessage,
          workspaceId,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        
        // Emit to socket for real-time updates (broadcast the created message)
        if (socket) {
          socket.emit('message-created', {
            workspaceId,
            message: newMessage,
          });
        }
        
        setMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = message.trim().length > 0 && !isSending;

  return (
    <div className="border-t border-gray-200 bg-white flex-shrink-0">
      <div className="px-4 py-3">
        <div className="flex items-end space-x-3">
          {/* Additional actions - hidden on mobile */}
          <div className="hidden sm:flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-gray-600 h-9 w-9 p-0 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className={cn(
                "min-h-[40px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg bg-white text-gray-900 placeholder-gray-500",
                "pr-20 py-2 pl-3 text-sm" // Space for buttons
              )}
              disabled={isSending}
            />
            
            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-7 w-7 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Paperclip className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-7 w-7 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Smile className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={!canSend}
            size="sm"
            className={cn(
              "px-3 py-2 h-9 rounded-lg font-medium transition-colors",
              canSend 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Character count or other info */}
        {message.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="text-gray-500 hidden sm:block">
              <span>Press Enter to send • Shift+Enter for new line</span>
            </div>
            <span className={cn(
              "font-medium ml-auto",
              message.length > 1800 ? "text-red-500" : "text-gray-500"
            )}>
              {message.length}/2000
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
