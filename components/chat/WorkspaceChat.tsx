'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatArea } from './ChatArea';

interface Workspace {
  id: string;
  name: string;
  image?: string | null;
  color: string;
  _count: {
    subscribers: number;
  };
  subscribers: Array<{
    user: {
      id: string;
      name: string;
      username: string;
      image?: string | null;
    };
  }>;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface WorkspaceChatProps {
  workspaces: Workspace[];
  currentUser: CurrentUser;
}

const colorMap = {
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-500',
  RED: 'bg-red-500',
  PURPLE: 'bg-purple-500',
  PINK: 'bg-pink-500',
  INDIGO: 'bg-indigo-500',
  GRAY: 'bg-gray-500',
};

export function WorkspaceChat({ workspaces, currentUser }: WorkspaceChatProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    workspaces.length > 0 ? workspaces[0] : null
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white transition-all duration-300 flex flex-col",
        sidebarCollapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Workspace Chat</h1>
                <p className="text-sm text-gray-400">
                  {currentUser.name || currentUser.username}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-gray-700"
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
        </div>

        {/* Workspaces List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {!sidebarCollapsed && (
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Workspaces
              </h3>
            )}
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className={cn(
                  "w-full flex items-center p-2 rounded-lg transition-colors",
                  selectedWorkspace?.id === workspace.id
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0",
                  colorMap[workspace.color as keyof typeof colorMap] || colorMap.BLUE
                )}>
                  {workspace.image ? (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={workspace.image} alt={workspace.name} />
                      <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{workspace.name}</p>
                    <p className="text-sm text-gray-400">
                      {workspace._count.subscribers} members
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.image || ''} alt={currentUser.name} />
              <AvatarFallback>
                {currentUser.name?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {currentUser.name || currentUser.username}
                </p>
                <p className="text-xs text-gray-400 truncate">Online</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedWorkspace ? (
          <ChatArea 
            workspace={selectedWorkspace} 
            currentUser={currentUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Workspace Chat
              </h2>
              <p className="text-gray-600">
                Select a workspace from the sidebar to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
