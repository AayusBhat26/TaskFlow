"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  conversationId: string;
  replyTo?: any | null;
  onCancelReply?: () => void;
  onMessageSent?: (message: any) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  replyTo,
  onCancelReply,
  onMessageSent,
}) => {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSendMessage = async () => {
    if (message.trim()) {
      const messageContent = message.trim();
      const messageData = {
        conversationId,
        content: messageContent,
        messageType: "TEXT" as const,
        replyToId: replyTo?.id,
      };

      // Clear input immediately for better UX
      setMessage("");
      if (onCancelReply) {
        onCancelReply();
      }
      handleStopTyping();

      // Add optimistic update
      if (onMessageSent) {
        onMessageSent({
          id: `temp-${Date.now()}`,
          content: messageContent,
          messageType: "TEXT",
          replyToId: replyTo?.id,
          createdAt: new Date(),
          isOptimistic: true,
        });
      }

      try {
        // Send message via API first
        const response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Message sent successfully:', result);
          
          // Now emit via socket for real-time updates to other users
          // Include all the message data from the API response
          sendMessage({
            ...messageData,
            id: result.id,
            senderId: result.senderId,
            senderName: result.sender?.name || result.sender?.username,
            senderImage: result.sender?.image,
            createdAt: result.createdAt,
          });
        } else {
          console.error('Failed to send message:', await response.text());
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleStartTyping();
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, isTyping, stopTyping]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            rows={1}
          />
        </div>
        
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-10 w-10"
            onClick={() => {
              // TODO: Add emoji picker
            }}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="p-2 h-10 w-10 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
