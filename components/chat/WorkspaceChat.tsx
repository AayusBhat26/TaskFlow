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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full bg-white">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative z-50",
        // Desktop behavior
        "hidden lg:flex",
        sidebarCollapsed ? "lg:w-16" : "lg:w-80",
        // Mobile behavior
        mobileMenuOpen ? "fixed inset-y-0 left-0 w-80 flex" : "hidden"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <div className="flex items-center mb-1">
                  <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                  <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
                </div>
                <p className="text-sm text-gray-600">
                  {currentUser.name || currentUser.username}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 hidden lg:flex"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Workspaces List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Workspaces
              </h3>
            )}
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  setSelectedWorkspace(workspace);
                  setMobileMenuOpen(false); // Close mobile menu when workspace is selected
                }}
                className={cn(
                  "w-full flex items-center p-3 rounded-lg transition-all duration-200",
                  selectedWorkspace?.id === workspace.id
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
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
                {(!sidebarCollapsed || mobileMenuOpen) && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate text-sm">{workspace.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {workspace._count.subscribers} members
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.image || ''} alt={currentUser.name} />
                <AvatarFallback className="bg-blue-500 text-white font-semibold">
                  {currentUser.name?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-gray-900">
                  {currentUser.name || currentUser.username}
                </p>
                <p className="text-xs text-green-600 truncate flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Online
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedWorkspace ? (
          <ChatArea 
            workspace={selectedWorkspace} 
            currentUser={currentUser}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Chat
              </h2>
              <p className="text-gray-600 text-sm">
                Select a workspace from the sidebar to start chatting with your team.
              </p>
              {/* Mobile workspace selector button */}
              <Button 
                onClick={() => setMobileMenuOpen(true)}
                className="mt-4 lg:hidden"
                variant="outline"
              >
                Select Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
