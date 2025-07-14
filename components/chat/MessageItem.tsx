"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Reply, MoreHorizontal, Heart, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { ExtendedMessage } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/context/SocketProvider";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: ExtendedMessage;
  currentUserId: string;
  onReply: (message: ExtendedMessage) => void;
  isLastMessage?: boolean;
}

const popularEmojis = ["❤️", "👍", "😂", "😮", "😢", "👎"];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onReply,
  isLastMessage,
}) => {
  const { addReaction, removeReaction } = useSocket();
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.senderId === currentUserId;

  const handleReaction = (emoji: string) => {
    const existingReaction = message.reactions.find(
      (r) => r.userId === currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
  };

  const formatTime = (date: string | Date) => {
    return format(new Date(date), "HH:mm");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative",
        isOwnMessage ? "flex justify-end" : "flex justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "flex max-w-[80%] space-x-2",
          isOwnMessage ? "flex-row-reverse space-x-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={message.sender.image || ""} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(message.sender.name || message.sender.username || "U")}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex flex-col space-y-1">
          {/* Sender name and time */}
          {!isOwnMessage && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message.sender.name || message.sender.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}

          {/* Reply indicator */}
          {message.replyTo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 border-l-2 border-blue-500 pl-2 ml-2">
              <span className="font-medium">
                {message.replyTo.sender.name || message.replyTo.sender.username}
              </span>
              <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
            </div>
          )}

          {/* Message content */}
          <div
            className={cn(
              "relative px-4 py-3 rounded-2xl shadow-sm",
              isOwnMessage
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              message.replyTo && "mt-1"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Message time for own messages */}
            {isOwnMessage && (
              <div className="flex justify-end mt-1">
                <span className="text-xs opacity-70">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            )}

            {/* Action buttons */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute top-0 flex space-x-1",
                  isOwnMessage ? "-left-20" : "-right-20"
                )}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-md"
                  onClick={() => onReply(message)}
                >
                  <Reply className="h-3 w-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-md"
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {popularEmojis.map((emoji) => (
                        <DropdownMenuItem
                          key={emoji}
                          className="p-2 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleReaction(emoji)}
                        >
                          <span className="text-lg">{emoji}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([emoji, count]) => {
                const userReacted = message.reactions.some(
                  (r) => r.emoji === emoji && r.userId === currentUserId
                );
                
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors",
                      userReacted
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
