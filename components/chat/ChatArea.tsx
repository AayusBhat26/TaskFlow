'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Hash, 
  Send,
  Smile,
  Paperclip,
  MoreVertical
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

export function ChatArea({ workspace, currentUser }: ChatAreaProps) {
  const { joinWorkspace, leaveWorkspace } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-white mr-3",
              colorMap[workspace.color as keyof typeof colorMap] || colorMap.BLUE
            )}>
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {workspace.name}
              </h1>
              <p className="text-sm text-gray-500">
                {workspace._count.subscribers} members
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Online members preview */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {workspace.subscribers.length} members
              </span>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          <MessageList 
            workspaceId={workspace.id} 
            currentUser={currentUser}
          />
          <ChatInput 
            workspaceId={workspace.id}
            currentUser={currentUser}
          />
        </div>

        {/* Members Sidebar */}
        <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Members</h3>
          <div className="space-y-2">
            {workspace.subscribers.map((subscription) => (
              <div 
                key={subscription.user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={subscription.user.image || ''} 
                    alt={subscription.user.name} 
                  />
                  <AvatarFallback>
                    {subscription.user.name?.charAt(0) || 
                     subscription.user.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {subscription.user.name || subscription.user.username}
                    {subscription.user.id === currentUser.id && (
                      <span className="text-gray-500 ml-1">(you)</span>
                    )}
                  </p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
