"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, X, Users } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import { ExtendedWorkspace, ExtendedMessage } from "@/types/chat";
import { useSession } from "next-auth/react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineUsers } from "@/components/chat/OnlineUsers";
import { cn } from "@/lib/utils";

interface ChatContainerProps {
  workspace: ExtendedWorkspace;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ workspace }) => {
  const { data: session } = useSession();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>(workspace.conversation?.messages || []);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(workspace.conversation?.id || null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && session?.user?.id) {
      socket.joinConversation(conversationId);
      
      return () => {
        if (conversationId) {
          socket.leaveConversation(conversationId);
        }
      };
    }
  }, [conversationId, session?.user?.id, socket]);

  useEffect(() => {
    const handleMessageReceived = (messageData: any) => {
      // Don't add message if it's from the current user (avoid echoing back sent messages)
      if (messageData.senderId === session?.user?.id) {
        return;
      }

      const newMessage: ExtendedMessage = {
        id: messageData.id,
        content: messageData.content,
        senderId: messageData.senderId,
        conversationId: messageData.conversationId,
        createdAt: new Date(messageData.createdAt),
        messageType: messageData.messageType,
        replyToId: messageData.replyToId,
        updatedAt: null,
        isDeleted: false,
        deletedAt: null,
        edited: false,
        sender: {
          id: messageData.senderId,
          name: messageData.senderName || "",
          image: messageData.senderImage || "",
          username: messageData.senderName || "",
          surname: null,
          email: null,
          emailVerified: null,
          hashedPassword: null,
          completedOnboarding: true,
          useCase: null,
          isOnline: true,
          lastSeen: new Date(),
        },
        replyTo: messageData.replyTo || null,
        reactions: [],
        readBy: [],
      };

      setMessages(prev => [...prev, newMessage]);
      
      if (!isOpen) {
        setNewMessageCount(prev => prev + 1);
      }
    };

    const handleMessageReaction = (reactionData: any) => {
      const { messageId, userId, emoji, action } = reactionData;
      
      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          const updatedReactions = [...message.reactions];
          
          if (action === "add") {
            // Add reaction if it doesn't exist
            const existingReactionIndex = updatedReactions.findIndex(
              r => r.userId === userId && r.emoji === emoji
            );
            
            if (existingReactionIndex === -1) {
              updatedReactions.push({
                id: `${messageId}-${userId}-${emoji}`,
                messageId,
                userId,
                emoji,
                createdAt: new Date(),
                user: {
                  id: userId,
                  name: "",
                  username: "",
                  image: "",
                  surname: null,
                  email: null,
                  emailVerified: null,
                  hashedPassword: null,
                  completedOnboarding: true,
                  useCase: null,
                  isOnline: true,
                  lastSeen: new Date(),
                }
              });
            }
          } else if (action === "remove") {
            // Remove reaction
            const reactionIndex = updatedReactions.findIndex(
              r => r.userId === userId && r.emoji === emoji
            );
            if (reactionIndex !== -1) {
              updatedReactions.splice(reactionIndex, 1);
            }
          }
          
          return {
            ...message,
            reactions: updatedReactions
          };
        }
        return message;
      }));
    };

    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.socket?.on("message_received", handleMessageReceived);
      // @ts-ignore
      window.socket?.on("message_reaction", handleMessageReaction);
      
      return () => {
        // @ts-ignore
        window.socket?.off("message_received", handleMessageReceived);
        // @ts-ignore
        window.socket?.off("message_reaction", handleMessageReaction);
      };
    }
  }, [isOpen, session?.user?.id]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNewMessageCount(0);
    }
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleMessageSent = (message: any) => {
    // Add the sent message to local state immediately for better UX
    const newMessage: ExtendedMessage = {
      id: message.id,
      content: message.content,
      senderId: session?.user?.id || "test-user-id",
      conversationId: message.conversationId || conversationId || workspace.id,
      createdAt: new Date(message.createdAt),
      messageType: message.messageType || "TEXT",
      replyToId: message.replyToId,
      updatedAt: null,
      isDeleted: false,
      deletedAt: null,
      edited: false,
      sender: {
        id: session?.user?.id || "test-user-id",
        name: session?.user?.name || "Test User",
        image: "",
        username: session?.user?.name || "Test User",
        surname: null,
        email: null,
        emailVerified: null,
        hashedPassword: null,
        completedOnboarding: true,
        useCase: null,
        isOnline: true,
        lastSeen: new Date(),
      },
      replyTo: message.replyTo || null,
      reactions: [],
      readBy: [],
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleReactionChange = useCallback((messageId: string, emoji: string, action: 'add' | 'remove') => {
    if (!session?.user?.id) return;

    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const updatedReactions = [...message.reactions];
        
        if (action === 'add') {
          // Add reaction if it doesn't exist
          const existingReactionIndex = updatedReactions.findIndex(
            r => r.userId === session.user.id && r.emoji === emoji
          );
          
          if (existingReactionIndex === -1) {
            const newReaction = {
              id: `${messageId}-${session.user.id}-${emoji}`,
              messageId,
              userId: session.user.id,
              emoji,
              createdAt: new Date(),
              user: {
                id: session.user.id,
                name: session.user.name || "",
                username: session.user.name || "",
                image: "",
                surname: null,
                email: null,
                emailVerified: null,
                hashedPassword: null,
                completedOnboarding: true,
                useCase: null,
                isOnline: true,
                lastSeen: new Date(),
              }
            };
            updatedReactions.push(newReaction);
          }
        } else if (action === 'remove') {
          // Remove reaction
          const reactionIndex = updatedReactions.findIndex(
            r => r.userId === session.user.id && r.emoji === emoji
          );
          if (reactionIndex !== -1) {
            updatedReactions.splice(reactionIndex, 1);
          }
        }
        
        return {
          ...message,
          reactions: updatedReactions
        };
      }
      return message;
    }));
  }, [session?.user?.id]);

  if (!workspace.conversation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] md:w-96">
      <motion.div
        className={cn(
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg shadow-2xl overflow-hidden",
          "transition-all duration-300 ease-in-out"
        )}
        initial={false}
        animate={{
          height: isOpen ? "500px" : "auto",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Chat Header */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer select-none"
          onClick={handleToggleChat}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              {newMessageCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newMessageCount > 99 ? "99+" : newMessageCount}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">Team Chat</h3>
              <p className="text-xs opacity-90">{workspace.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <OnlineUsers />
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </div>
        </div>

        {/* Chat Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex flex-col h-[436px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Messages Area */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <MessageList
                  messages={messages}
                  currentUserId={session?.user?.id || ""}
                  onReply={handleReply}
                  onReactionChange={handleReactionChange}
                />
                <TypingIndicator
                  conversationId={workspace.conversation.id}
                  currentUserId={session?.user?.id || ""}
                />
              </div>

              {/* Reply Preview */}
              {replyTo && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Replying to {replyTo.sender.name}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {replyTo.content}
                      </p>
                    </div>
                    <button
                      onClick={handleCancelReply}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <MessageInput
                  conversationId={conversationId || workspace.id}
                  replyTo={replyTo}
                  onCancelReply={handleCancelReply}
                  onMessageSent={handleMessageSent}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
