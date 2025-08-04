'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Hash, 
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Menu,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/context/SocketProvider';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

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

interface ChatAreaProps {
  workspace: Workspace;
  currentUser: CurrentUser;
  onOpenMobileMenu?: () => void;
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

export function ChatArea({ workspace, currentUser, onOpenMobileMenu }: ChatAreaProps) {
  const { joinWorkspace, leaveWorkspace } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);

  // Join workspace when component mounts or workspace changes
  useEffect(() => {
    if (workspace.id) {
      joinWorkspace(workspace.id);
    }

    return () => {
      if (workspace.id) {
        leaveWorkspace(workspace.id);
      }
    };
  }, [workspace.id, joinWorkspace, leaveWorkspace]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile menu button */}
            {onOpenMobileMenu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMobileMenu}
                className="mr-3 lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 flex-shrink-0"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 flex-shrink-0",
              colorMap[workspace.color as keyof typeof colorMap] || colorMap.BLUE
            )}>
              <Hash className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {workspace.name}
              </h1>
              <p className="text-sm text-gray-500 flex items-center">
                <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{workspace._count.subscribers} members</span>
                <span className="mx-2">•</span>
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 flex-shrink-0"></div>
                <span className="text-green-600 font-medium truncate">{workspace.subscribers.length} online</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile members toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden p-1"
              onClick={() => setShowMembersSidebar(!showMembersSidebar)}
            >
              <Users className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <MessageList 
            workspaceId={workspace.id} 
            currentUser={currentUser}
          />
          <ChatInput 
            workspaceId={workspace.id}
            currentUser={currentUser}
          />
        </div>

        {/* Members Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-gray-50 border-l border-gray-200 p-4 flex-shrink-0 overflow-hidden">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-600" />
            Members
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
              {workspace.subscribers.length}
            </Badge>
          </h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {workspace.subscribers.map((subscription) => (
                <div 
                  key={subscription.user.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={subscription.user.image || ''} 
                        alt={subscription.user.name} 
                      />
                      <AvatarFallback className="bg-blue-500 text-white font-semibold">
                        {subscription.user.name?.charAt(0) || 
                         subscription.user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {subscription.user.name || subscription.user.username}
                      {subscription.user.id === currentUser.id && (
                        <span className="text-blue-600 font-normal ml-1 text-xs">(you)</span>
                      )}
                    </p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Members Sidebar - Mobile Overlay */}
        {showMembersSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowMembersSidebar(false)}
            />
            <div className="fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 p-4 z-50 lg:hidden overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Members
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                    {workspace.subscribers.length}
                  </Badge>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMembersSidebar(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {workspace.subscribers.map((subscription) => (
                    <div 
                      key={subscription.user.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={subscription.user.image || ''} 
                            alt={subscription.user.name} 
                          />
                          <AvatarFallback className="bg-blue-500 text-white font-semibold">
                            {subscription.user.name?.charAt(0) || 
                             subscription.user.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {subscription.user.name || subscription.user.username}
                          {subscription.user.id === currentUser.id && (
                            <span className="text-blue-600 font-normal ml-1 text-xs">(you)</span>
                          )}
                        </p>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
