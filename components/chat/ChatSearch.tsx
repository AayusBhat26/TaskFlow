"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Filter, Calendar, User, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserDisplayName, getUserInitials } from "@/lib/userUtils";
import { MessageType } from "@prisma/client";

interface ChatSearchProps {
  conversationId: string;
  onMessageSelect?: (messageId: string) => void;
}

interface SearchFilters {
  fromDate?: Date;
  toDate?: Date;
  senderId?: string;
  messageType?: string;
  hasAttachments?: boolean;
}

interface SearchResult {
  id: string;
  content: string;
  createdAt: string;
  edited: boolean;
  sender: {
    id: string;
    name: string;
    image?: string;
    username: string;
  };
  attachments: any[];
  messageType: string;
}

interface SearchResponse {
  messages: SearchResult[];
  totalCount: number;
  hasMore: boolean;
  query: string;
  filters?: SearchFilters;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  conversationId,
  onMessageSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const searchMessages = async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          conversationId,
          filters: searchFilters,
          limit: 20,
          offset: 0,
        }),
      });

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data);
      } else {
        setError('Failed to search messages');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchMessages(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case MessageType.FILE_UPLOAD:
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search messages..."
              className="pl-10"
            />
          </div>
          
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "relative",
                  hasActiveFilters && "border-blue-500 bg-blue-50 dark:bg-blue-950"
                )}
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {filters.fromDate ? format(filters.fromDate, "MMM dd") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.fromDate}
                          onSelect={(date) => setFilters(prev => ({ ...prev, fromDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {filters.toDate ? format(filters.toDate, "MMM dd") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.toDate}
                          onSelect={(date) => setFilters(prev => ({ ...prev, toDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {/* Message Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={filters.messageType === MessageType.TEXT ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        messageType: prev.messageType === MessageType.TEXT ? undefined : MessageType.TEXT 
                      }))}
                    >
                      Text
                    </Button>
                    <Button
                      variant={filters.messageType === MessageType.FILE_UPLOAD ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        messageType: prev.messageType === MessageType.FILE_UPLOAD ? undefined : MessageType.FILE_UPLOAD 
                      }))}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Files
                    </Button>
                  </div>
                </div>
                
                {/* Has Attachments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={filters.hasAttachments === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        hasAttachments: prev.hasAttachments === true ? undefined : true 
                      }))}
                    >
                      With files
                    </Button>
                    <Button
                      variant={filters.hasAttachments === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        hasAttachments: prev.hasAttachments === false ? undefined : false 
                      }))}
                    >
                      Text only
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
            {isLoading ? "..." : "Search"}
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          )}
          
          {results && results.messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages found</p>
              <p className="text-sm">Try adjusting your search terms or filters</p>
            </div>
          )}
          
          {results && results.messages.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-500 mb-3">
                Found {results.totalCount} message{results.totalCount !== 1 ? 's' : ''}
              </div>
              
              {results.messages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    onMessageSelect?.(message.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender.image || ""} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(message.sender)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {getUserDisplayName(message.sender)}
                        </span>
                        {getMessageTypeIcon(message.messageType)}
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.createdAt), "MMM dd, HH:mm")}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-gray-400">(edited)</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {highlightText(message.content, query)}
                      </p>
                      
                      {message.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {results.hasMore && (
                <div className="text-center py-2">
                  <Button variant="outline" size="sm">
                    Load more results
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
