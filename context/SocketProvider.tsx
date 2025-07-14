"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { socket, connectSocket, disconnectSocket } from "@/lib/socket";
import { ChatState } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface SocketContextType extends ChatState {
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    messageType?: "TEXT" | "SYSTEM";
    replyToId?: string;
    id?: string;
    senderId?: string;
    senderName?: string;
    senderImage?: string;
    createdAt?: string;
  }) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [chatState, setChatState] = useState<ChatState>({
    activeUsers: new Map(),
    typingUsers: new Map(),
    isConnected: false,
    currentConversationId: null,
  });

  // Socket connection management
  useEffect(() => {
    if (session?.user?.id) {
      console.log('Connecting socket for user:', session.user.name);
      console.log('Socket URL:', process.env.NODE_ENV === "production" 
        ? process.env.NEXT_PUBLIC_SOCKET_URL 
        : "http://localhost:3001");
      
      connectSocket(
        session.user.id,
        session.user.name || "",
        session.user.image || ""
      );
      
      socket.on("connect", () => {
        setChatState(prev => ({ ...prev, isConnected: true }));
        console.log("Socket connected successfully to port 3001");
        
        // Set socket on window for global access
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.socket = socket;
          console.log("Socket instance set on window object");
        }
        
        toast({
          title: "Connected",
          description: "Real-time chat is now active",
          duration: 3000,
        });
      });

      socket.on("disconnect", () => {
        setChatState(prev => ({ ...prev, isConnected: false }));
        console.log("Socket disconnected");
        
        toast({
          title: "Disconnected",
          description: "Real-time chat is currently unavailable",
          variant: "destructive",
          duration: 3000,
        });
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        console.error("Make sure the Socket.io server is running on port 3001");
        console.error("Run: npm run dev:socket");
        setChatState(prev => ({ ...prev, isConnected: false }));
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server. Make sure the socket server is running on port 3001.",
          variant: "destructive",
          duration: 5000,
        });
      });

      // Attempt to reconnect every 5 seconds if disconnected
      const reconnectInterval = setInterval(() => {
        if (!socket.connected && session?.user?.id) {
          console.log("Attempting to reconnect socket...");
          connectSocket(
            session.user.id,
            session.user.name || "",
            session.user.image || ""
          );
        }
      }, 5000);

      return () => {
        clearInterval(reconnectInterval);
        disconnectSocket();
      };
    }
  }, [session?.user?.id, toast]);

  // Socket event listeners
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleUserJoined = (user: any) => {
      setChatState(prev => {
        const newActiveUsers = new Map(prev.activeUsers);
        newActiveUsers.set(user.id, user);
        return { ...prev, activeUsers: newActiveUsers };
      });
      
      if (user.id !== session.user.id) {
        toast({
          title: "User joined",
          description: `${user.name} joined the conversation`,
          duration: 3000,
        });
      }
    };

    const handleUserLeft = (userId: string) => {
      setChatState(prev => {
        const newActiveUsers = new Map(prev.activeUsers);
        const user = newActiveUsers.get(userId);
        newActiveUsers.delete(userId);
        
        if (user && userId !== session.user.id) {
          toast({
            title: "User left",
            description: `${user.name} left the conversation`,
            duration: 3000,
          });
        }
        
        return { ...prev, activeUsers: newActiveUsers };
      });
    };

    const handleUserTyping = (data: any) => {
      if (data.userId !== session.user.id) {
        setChatState(prev => {
          const newTypingUsers = new Map(prev.typingUsers);
          newTypingUsers.set(data.userId, data);
          return { ...prev, typingUsers: newTypingUsers };
        });
      }
    };

    const handleUserStoppedTyping = (data: any) => {
      setChatState(prev => {
        const newTypingUsers = new Map(prev.typingUsers);
        newTypingUsers.delete(data.userId);
        return { ...prev, typingUsers: newTypingUsers };
      });
    };

    const handleOnlineUsers = (users: any[]) => {
      setChatState(prev => {
        const newActiveUsers = new Map();
        users.forEach(user => newActiveUsers.set(user.id, user));
        return { ...prev, activeUsers: newActiveUsers };
      });
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      socket.off("online_users", handleOnlineUsers);
    };
  }, [session?.user?.id]);

  // Helper functions - Memoized to prevent re-renders
  const joinConversation = useCallback((conversationId: string) => {
    socket.emit("join_conversation", conversationId);
    setChatState(prev => ({ ...prev, currentConversationId: conversationId }));
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socket.emit("leave_conversation", conversationId);
    setChatState(prev => ({ ...prev, currentConversationId: null }));
  }, []);

  const sendMessage = useCallback((data: {
    conversationId: string;
    content: string;
    messageType?: "TEXT" | "SYSTEM";
    replyToId?: string;
    id?: string;
    senderId?: string;
    senderName?: string;
    senderImage?: string;
    createdAt?: string;
  }) => {
    socket.emit("send_message", data);
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socket.emit("typing", { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socket.emit("stop_typing", { conversationId });
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    socket.emit("add_reaction", { messageId, emoji });
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    socket.emit("remove_reaction", { messageId, emoji });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): SocketContextType => ({
    ...chatState,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
  }), [
    chatState,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
