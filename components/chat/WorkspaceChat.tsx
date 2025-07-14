"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Users, Send, Smile } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketProvider";
import { getWorkspaces, getConversation } from "@/lib/api";
import { Workspace } from "@prisma/client";
import { ExtendedMessage } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageItem } from "@/components/chat/MessageItem";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { EmojiSelector } from "@/components/common/EmojiSelector";
import { cn } from "@/lib/utils";

interface WorkspaceChatProps {
  workspaceId: string;
  onClose: () => void;
}

const WorkspaceChat: React.FC<WorkspaceChatProps> = ({ workspaceId, onClose }) => {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation when workspace changes - Add loading state management
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const loadConversation = async () => {
      if (!workspaceId || !session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const conversation = await getConversation(workspaceId, session.user.id);
        if (isMounted) {
          if (conversation) {
            setConversationId(conversation.id);
            setMessages(conversation.messages || []);
            socket.joinConversation(conversation.id);
          } else {
            // No conversation yet, will be created when first message is sent
            setConversationId(workspaceId); // Use workspace ID temporarily
            setMessages([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load conversation:", error);
          setConversationId(workspaceId);
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConversation();

    return () => {
      isMounted = false;
      if (conversationId) {
        socket.leaveConversation(conversationId);
      }
    };
  }, [workspaceId, session?.user?.id]); // Removed socket dependency to prevent re-renders

  // Handle new messages
  useEffect(() => {
    const handleNewMessage = (messageData: any) => {
      const newMsg: ExtendedMessage = {
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
        replyTo: null,
        reactions: [],
        readBy: [],
      };

      setMessages(prev => [...prev, newMsg]);
    };

    // Use socket events through the context
    // The actual socket events are handled by the socket server and SocketProvider
    // We'll rely on the server-side broadcasting for now
    
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;

    socket.sendMessage({
      conversationId,
      content: newMessage.trim(),
      messageType: "TEXT",
    });

    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + String.fromCodePoint(parseInt(emoji, 16)));
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Workspace Chat
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MessageItem
                  message={message}
                  currentUserId={session?.user?.id || ""}
                  onReply={() => {}} // Placeholder for now
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Typing Indicator */}
        {conversationId && (
          <TypingIndicator 
            conversationId={conversationId} 
            currentUserId={session?.user?.id || ""} 
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <EmojiSelector
              onSelectedEmoji={handleEmojiSelect}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <Smile className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
              </Button>
            </EmojiSelector>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceChat;
