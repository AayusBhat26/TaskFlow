"use client";

import React from "react";
import { useSocket } from "@/context/SocketProvider";

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId,
}) => {
  const { typingUsers } = useSocket();

  const typingInThisConversation = Array.from(typingUsers.values()).filter(
    (typing) => typing.conversationId === conversationId && typing.userId !== currentUserId
  );

  if (typingInThisConversation.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingInThisConversation.length === 1) {
      return `${typingInThisConversation[0].userName} is typing...`;
    } else if (typingInThisConversation.length === 2) {
      return `${typingInThisConversation[0].userName} and ${typingInThisConversation[1].userName} are typing...`;
    } else {
      return `${typingInThisConversation.length} people are typing...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
        <span>{getTypingText()}</span>
      </div>
    </div>
  );
};
