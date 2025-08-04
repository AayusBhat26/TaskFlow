'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSocket } from '@/context/SocketProvider';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    image?: string | null;
  };
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface MessageListProps {
  workspaceId: string;
  currentUser: CurrentUser;
}

export function MessageList({ workspaceId, currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chat/messages?workspaceId=${workspaceId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      loadMessages();
    }
  }, [workspaceId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          {Object.keys(messageGroups).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 max-w-sm px-4">
                Be the first to start the conversation in this workspace!
              </p>
            </div>
          ) : (
          Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date} className="mb-6">
              {/* Date separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <div className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                  {formatDate(dayMessages[0].createdAt)}
                </div>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {dayMessages.map((message, index) => {
                  const isCurrentUser = message.author.id === currentUser.id;
                  const prevMessage = index > 0 ? dayMessages[index - 1] : null;
                  const showAvatar = !prevMessage || prevMessage.author.id !== message.author.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start space-x-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors group",
                        !showAvatar && "ml-11"
                      )}
                    >
                      {showAvatar ? (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage 
                            src={message.author.image || ''} 
                            alt={message.author.name} 
                          />
                          <AvatarFallback className="bg-blue-500 text-white font-semibold">
                            {message.author.name?.charAt(0) || 
                             message.author.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {message.author.name || message.author.username}
                              {isCurrentUser && (
                                <span className="text-blue-600 font-normal ml-1 text-xs">(you)</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "rounded-lg px-3 py-2 max-w-full lg:max-w-2xl border",
                          isCurrentUser 
                            ? "bg-blue-500 text-white border-blue-500 ml-8" 
                            : "bg-white border-gray-200",
                          !showAvatar && "mt-1"
                        )}>
                          <p className={cn(
                            "text-sm whitespace-pre-wrap break-words",
                            isCurrentUser ? "text-white" : "text-gray-900"
                          )}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
    </div>
  );
}
