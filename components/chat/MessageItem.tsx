"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Reply, MoreHorizontal, Heart, ThumbsUp, Edit, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { ExtendedMessage } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSocket } from "@/context/SocketProvider";
import { cn } from "@/lib/utils";
import { getUserDisplayName, getUserInitials } from "@/lib/userUtils";
import { FileAttachment } from "./FileAttachment";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageItemProps {
  message: ExtendedMessage;
  currentUserId: string;
  onReply: (message: ExtendedMessage) => void;
  onReactionChange?: (messageId: string, emoji: string, action: 'add' | 'remove') => void;
  onMessageUpdate?: (messageId: string, content: string) => void;
  onMessageDelete?: (messageId: string) => void;
  isLastMessage?: boolean;
}

const popularEmojis = ["❤️", "👍", "😂", "😮", "😢", "👎"];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onReply,
  onReactionChange,
  onMessageUpdate,
  onMessageDelete,
  isLastMessage,
}) => {
  const { addReaction, removeReaction } = useSocket();
  const [showActions, setShowActions] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isOwnMessage = message.senderId === currentUserId;

  const handleReaction = (emoji: string) => {
    console.log(`Handling reaction: ${emoji} for message ${message.id} by user ${currentUserId}`);
    const existingReaction = message.reactions.find(
      (r) => r.userId === currentUserId && r.emoji === emoji
    );

    console.log('Existing reaction found:', existingReaction);
    console.log('Current message reactions:', message.reactions);

    if (existingReaction) {
      console.log(`Removing reaction: ${emoji}`);
      // Optimistic update first
      onReactionChange?.(message.id, emoji, 'remove');
      // Then call API
      removeReaction(message.id, emoji);
    } else {
      console.log(`Adding reaction: ${emoji}`);
      // Optimistic update first
      onReactionChange?.(message.id, emoji, 'add');
      // Then call API
      addReaction(message.id, emoji);
    }
    
    // Close dropdown after reaction
    setDropdownOpen(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setDropdownOpen(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === message.content.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/chat/message/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        onMessageUpdate?.(message.id, editContent.trim());
        setIsEditing(false);
      } else {
        console.error('Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDeleteMessage = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chat/message/${message.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onMessageDelete?.(message.id);
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleMouseEnter = () => {
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    // Only hide actions if dropdown is not open
    if (!dropdownOpen) {
      setShowActions(false);
    }
  };

  // Effect to hide actions when dropdown closes
  useEffect(() => {
    if (!dropdownOpen) {
      // Small delay to allow for smooth interaction
      const timer = setTimeout(() => {
        setShowActions(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dropdownOpen]);

  const formatTime = (date: string | Date) => {
    return format(new Date(date), "HH:mm");
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative",
        isOwnMessage ? "flex justify-end" : "flex justify-start"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
              {getUserInitials(message.sender)}
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
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={cn(
                    "resize-none border-none focus:ring-2 focus:ring-blue-500 text-sm",
                    isOwnMessage 
                      ? "bg-white/10 text-white placeholder-white/70" 
                      : "bg-white dark:bg-gray-600"
                  )}
                  rows={3}
                  disabled={isSaving}
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs opacity-70">
                    Press Enter to save • ESC to cancel
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant={isOwnMessage ? "secondary" : "default"}
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editContent.trim()}
                      className="h-6 px-2 text-xs"
                    >
                      {isSaving ? "..." : <Check className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {message.content && (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    <MarkdownRenderer content={message.content} />
                    {message.edited && (
                      <span className="text-xs opacity-70 ml-2">(edited)</span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* File Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={cn("space-y-2", message.content && "mt-3")}>
                {message.attachments.map((attachment) => (
                  <FileAttachment
                    key={attachment.id}
                    id={attachment.id}
                    filename={attachment.filename}
                    originalName={attachment.originalName}
                    mimeType={attachment.mimeType}
                    size={attachment.size}
                    url={attachment.url}
                    createdAt={attachment.createdAt.toString()}
                    canDelete={false} // For now, disable deletion in messages
                    className="max-w-xs"
                  />
                ))}
              </div>
            )}

            {/* Message time for own messages */}
            {isOwnMessage && (
              <div className="flex justify-end mt-1">
                <span className="text-xs opacity-70">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            )}

            {/* Action buttons */}
            {showActions && !isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute top-0 flex space-x-1",
                  isOwnMessage ? "-left-28" : "-right-28"
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
                
                <DropdownMenu onOpenChange={setDropdownOpen}>
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

                {/* More options dropdown for own messages */}
                {isOwnMessage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-md"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit Message
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  if (!acc[reaction.emoji]) {
                    acc[reaction.emoji] = {
                      count: 0,
                      users: []
                    };
                  }
                  acc[reaction.emoji].count += 1;
                  acc[reaction.emoji].users.push(reaction.userId);
                  return acc;
                }, {} as Record<string, { count: number; users: string[] }>)
              ).map(([emoji, data]) => {
                const userReacted = data.users.includes(currentUserId);
                
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
                    <span>{data.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
