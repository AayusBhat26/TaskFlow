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
    <div className="border-t border-gray-200 bg-white">
      <div className="px-6 py-4">
        <div className="flex items-end space-x-3">
          {/* Additional actions */}
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-gray-600"
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
              placeholder={`Message workspace...`}
              className={cn(
                "min-h-[44px] max-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                "pr-24" // Space for buttons
              )}
              disabled={isSending}
            />
            
            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6"
              >
                <Paperclip className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6"
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
              "px-4 py-2",
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
          <div className="mt-2 text-xs text-gray-500 text-right">
            {message.length} characters
          </div>
        )}
      </div>
    </div>
  );
}
