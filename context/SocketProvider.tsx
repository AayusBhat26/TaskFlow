'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: (workspaceId: string) => void;
  sendMessage: (workspaceId: string, content: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinWorkspace: () => {},
  leaveWorkspace: () => {},
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Create real socket.io connection
    console.log('🔗 Socket: Connecting to chat server...');
    
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('🔗 Socket: Connected to chat server');
      setIsConnected(true);
      
      // Authenticate with server
      socketInstance.emit('authenticate', {
        userId: session.user.id,
        username: session.user.username || session.user.name || 'User'
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('🔗 Socket: Disconnected from chat server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error: Error) => {
      console.error('🔗 Socket: Connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('error', (error: Error) => {
      console.error('🔗 Socket: Error:', error);
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔗 Socket: Cleaning up connection');
      socketInstance.disconnect();
    };
  }, [session?.user]);

  const joinWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      console.log('🔗 Socket: Joining workspace:', workspaceId);
      socket.emit('join-workspace', { workspaceId });
    }
  };

  const leaveWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      console.log('🔗 Socket: Leaving workspace:', workspaceId);
      socket.emit('leave-workspace', { workspaceId });
    }
  };

  const sendMessage = (workspaceId: string, content: string) => {
    if (socket && isConnected && session?.user) {
      console.log('🔗 Socket: Sending message to workspace:', workspaceId);
      socket.emit('send-message', {
        workspaceId,
        content
      });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      joinWorkspace,
      leaveWorkspace,
      sendMessage,
    }}>
      {children}
    </SocketContext.Provider>
  );
}
