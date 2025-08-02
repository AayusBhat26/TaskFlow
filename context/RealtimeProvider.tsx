'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface RealtimeContextType {
  broadcastMessage: (workspaceId: string, message: any) => void;
  subscribeToWorkspace: (workspaceId: string, callback: (message: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  broadcastMessage: () => {},
  subscribeToWorkspace: () => () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [subscribers, setSubscribers] = useState<Map<string, Set<(message: any) => void>>>(new Map());

  const broadcastMessage = (workspaceId: string, message: any) => {
    const workspaceSubscribers = subscribers.get(workspaceId);
    if (workspaceSubscribers) {
      workspaceSubscribers.forEach(callback => callback(message));
    }
  };

  const subscribeToWorkspace = (workspaceId: string, callback: (message: any) => void) => {
    setSubscribers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(workspaceId)) {
        newMap.set(workspaceId, new Set());
      }
      newMap.get(workspaceId)!.add(callback);
      return newMap;
    });

    // Return unsubscribe function
    return () => {
      setSubscribers(prev => {
        const newMap = new Map(prev);
        const workspaceSet = newMap.get(workspaceId);
        if (workspaceSet) {
          workspaceSet.delete(callback);
          if (workspaceSet.size === 0) {
            newMap.delete(workspaceId);
          }
        }
        return newMap;
      });
    };
  };

  return (
    <RealtimeContext.Provider value={{ broadcastMessage, subscribeToWorkspace }}>
      {children}
    </RealtimeContext.Provider>
  );
}
