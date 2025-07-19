"use client";

import React, { useEffect, useRef } from "react";
import { MessageItem } from "@/components/chat/MessageItem";
import { ExtendedMessage } from "@/types/chat";

interface MessageListProps {
  messages: ExtendedMessage[];
  currentUserId: string;
  onReply: (message: ExtendedMessage) => void;
  onReactionChange?: (messageId: string, emoji: string, action: 'add' | 'remove') => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onReply,
  onReactionChange,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 h-full"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onReply={onReply}
              onReactionChange={onReactionChange}
              isLastMessage={index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
