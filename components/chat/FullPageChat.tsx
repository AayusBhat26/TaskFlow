"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, Send } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import { ExtendedWorkspace, ExtendedMessage } from "@/types/chat";
import { useSession } from "next-auth/react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineUsers } from "@/components/chat/OnlineUsers";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { cn } from "@/lib/utils";

interface FullPageChatProps {
  workspace: ExtendedWorkspace;
}

export const FullPageChat: React.FC<FullPageChatProps> = ({ workspace }) => {
  const { data: session } = useSession();
  const socket = useSocket();
  const [messages, setMessages] = useState<ExtendedMessage[]>(workspace.conversation?.messages || []);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(workspace.conversation?.id || null);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && session?.user?.id) {
      console.log('Joining conversation:', conversationId, 'for user:', session.user.name);
      socket.joinConversation(conversationId);
      
      return () => {
        if (conversationId) {
          console.log('Leaving conversation:', conversationId);
          socket.leaveConversation(conversationId);
        }
      };
    }
  }, [conversationId, session?.user?.id]);

  useEffect(() => {
    const handleMessageReceived = (messageData: any) => {
      console.log('Message received:', messageData);
      
      // Only add message if it's for this conversation
      if (messageData.conversationId !== conversationId) {
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
        attachments: messageData.attachments || [],
      };

      setMessages(prev => {
        // If this is a real message replacing an optimistic one
        const optimisticIndex = prev.findIndex(msg => 
          msg.id.startsWith('temp-') && 
          msg.content === newMessage.content &&
          msg.senderId === newMessage.senderId
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const updated = [...prev];
          updated[optimisticIndex] = newMessage;
          return updated;
        }

        // Prevent duplicate messages
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (exists) {
          return prev;
        }
        
        return [...prev, newMessage];
      });
    };

    const handleMessageReaction = (reactionData: any) => {
      console.log('Message reaction received:', reactionData);
      const { messageId, userId, emoji, action } = reactionData;
      
      setMessages(prev => {
        console.log(`Processing ${action} reaction: ${emoji} by user ${userId} on message ${messageId}`);
        
        return prev.map(message => {
          if (message.id === messageId) {
            console.log(`Found message ${messageId}, current reactions:`, message.reactions);
            const updatedReactions = [...message.reactions];
            
            if (action === "add") {
              // Add reaction if it doesn't exist
              const existingReactionIndex = updatedReactions.findIndex(
                r => r.userId === userId && r.emoji === emoji
              );
              
              if (existingReactionIndex === -1) {
                const newReaction = {
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
                };
                updatedReactions.push(newReaction);
                console.log(`Added reaction:`, newReaction);
              } else {
                console.log(`Reaction already exists at index ${existingReactionIndex}`);
              }
            } else if (action === "remove") {
              // Remove reaction
              const reactionIndex = updatedReactions.findIndex(
                r => r.userId === userId && r.emoji === emoji
              );
              if (reactionIndex !== -1) {
                console.log(`Removing reaction at index ${reactionIndex}`);
                updatedReactions.splice(reactionIndex, 1);
              } else {
                console.log(`Reaction to remove not found`);
              }
            }
            
            console.log(`Updated reactions for message ${messageId}:`, updatedReactions);
            return {
              ...message,
              reactions: updatedReactions
            };
          }
          return message;
        });
      });
    };

    // Try both socket instances for reliability
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const socketInstance = window.socket;
      if (socketInstance) {
        setSocketConnected(socketInstance.connected);
        socketInstance.on("message_received", handleMessageReceived);
        socketInstance.on("message_reaction", handleMessageReaction);
        socketInstance.on("connect", () => setSocketConnected(true));
        socketInstance.on("disconnect", () => setSocketConnected(false));
        console.log('Socket listener attached to window.socket, connected:', socketInstance.connected);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const socketInstance = window.socket;
        if (socketInstance) {
          socketInstance.off("message_received", handleMessageReceived);
          socketInstance.off("message_reaction", handleMessageReaction);
        }
      }
    };
  }, [conversationId]);

  // Handle scrolling to specific message from URL anchor
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#message-')) {
        const messageId = hash.replace('#message-', '');
        
        // Small delay to ensure the DOM is fully rendered
        setTimeout(() => {
          const messageElement = document.getElementById(`message-${messageId}`);
          if (messageElement) {
            messageElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
            
            // Add a temporary highlight effect
            messageElement.style.background = 'rgba(59, 130, 246, 0.1)';
            messageElement.style.border = '2px solid rgba(59, 130, 246, 0.3)';
            messageElement.style.borderRadius = '8px';
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
              messageElement.style.background = '';
              messageElement.style.border = '';
              messageElement.style.borderRadius = '';
            }, 3000);
          }
        }, 500);
      }
    }
  }, [messages]);

  const handleReply = useCallback((message: any) => {
    setReplyTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleMessageSent = useCallback((optimisticMessage: any) => {
    if (!session?.user) return;

    const newMessage: ExtendedMessage = {
      id: optimisticMessage.id,
      content: optimisticMessage.content,
      senderId: session.user.id,
      conversationId: conversationId || '',
      createdAt: optimisticMessage.createdAt,
      messageType: optimisticMessage.messageType,
      replyToId: optimisticMessage.replyToId,
      updatedAt: null,
      isDeleted: false,
      deletedAt: null,
      edited: false,
      sender: {
        id: session.user.id,
        name: session.user.name || "",
        image:  "",
        username: session.user.name || "",
        surname: null,
        email: null,
        emailVerified: null,
        hashedPassword: null,
        completedOnboarding: true,
        useCase: null,
        isOnline: true,
        lastSeen: new Date(),
      },
      replyTo: optimisticMessage.replyTo || null,
      reactions: [],
      readBy: [],
      attachments: optimisticMessage.attachments || [],
    };

    setMessages(prev => [...prev, newMessage]);
  }, [session?.user, conversationId]);

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
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8">
        <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No conversation found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start chatting with your team members
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Chat
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {workspace.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {conversationId && (
            <ChatSearch 
              conversationId={conversationId}
              onMessageSelect={(messageId) => {
                // TODO: Scroll to message
                console.log('Navigate to message:', messageId);
              }}
            />
          )}
          <OnlineUsers />
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </div>
          {/* Connection Status */}
          <div className="flex items-center space-x-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Disconnection Warning */}
      {!socketConnected && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 mt-2 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Real-time messaging unavailable.</strong> The Socket.io server isn't running.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Run <code className="bg-red-100 dark:bg-red-800 px-1 rounded">npm run dev:socket</code> in terminal to enable real-time features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={session?.user?.id || ""}
              onReply={handleReply}
              onReactionChange={handleReactionChange}
            />
          )}
        </div>

        {/* Typing Indicator */}
        <TypingIndicator
          conversationId={workspace.conversation.id}
          currentUserId={session?.user?.id || ""}
        />

        {/* Reply Preview */}
        {replyTo && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Replying to {replyTo.sender.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {replyTo.content}
                </p>
              </div>
              <button
                onClick={handleCancelReply}
                className="ml-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <MessageInput
            conversationId={conversationId || workspace.id}
            workspaceId={workspace.id}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
};
