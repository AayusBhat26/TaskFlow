"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUserDisplayName, getUserInitials } from "@/lib/userUtils";

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface UserMentionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  position: { top: number; left: number };
  searchQuery: string;
  workspaceId: string;
}

export const UserMention: React.FC<UserMentionProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  position,
  searchQuery,
  workspaceId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch workspace users
  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchWorkspaceUsers();
    }
  }, [isOpen, workspaceId]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setSelectedIndex(0);
  }, [searchQuery, users]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            onSelectUser(filteredUsers[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredUsers, onSelectUser, onClose]);

  const fetchWorkspaceUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/members`);
      if (response.ok) {
        const data = await response.json();
        const formattedUsers = data.members?.map((member: any) => ({
          id: member.id,
          name: member.name,
          username: member.username,
          image: member.image,
        })) || [];
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching workspace users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Mention dropdown */}
      <div
        ref={containerRef}
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 min-w-[200px] overflow-hidden"
        style={{
          top: position.top - 250, // Position above the cursor (dropdown height + margin)
          left: position.left,
          transform: position.top - 250 < 0 ? 'translateY(260px)' : 'none', // If too close to top, show below instead
        }}
      >
        {isLoading ? (
          <div className="p-3 text-center text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-3 text-center text-gray-500">
            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.map((user, index) => (
              <Button
                key={user.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto rounded-none",
                  index === selectedIndex && "bg-blue-50 dark:bg-blue-900"
                )}
                onClick={() => onSelectUser(user)}
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="text-xs text-gray-500">
                    @{user.username}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        {filteredUsers.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 text-center">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        )}
      </div>
    </>
  );
};
