'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  Tag, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCheck,
  List,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';

interface Task {
  id: string;
  title: string;
  emoji: string;
  content?: any;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  creator: {
    id: string;
    name: string;
    image?: string;
  };
  assignedToTask?: Array<{
    user: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  taskDate?: {
    id: string;
    from: string | null;
    to: string | null;
  };
  isCompleted?: boolean;
}

interface TasksModalProps {
  workspaceId?: string;
  trigger?: React.ReactNode;
}

export function TasksModal({ workspaceId, trigger }: TasksModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'pending'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const { tasks, loading, error, fetchTasks, completeTask, refreshTasks } = useTasks();

  // Fetch tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always fetch tasks when modal opens to ensure fresh data
      fetchTasks({
        workspaceId,
        search: searchQuery || undefined,
        filter: filterCompleted
      });
    }
  }, [isOpen]);

  // Handle search and filter changes with debouncing
  useEffect(() => {
    if (!isOpen) return;
    
    const timeoutId = setTimeout(() => {
      fetchTasks({
        workspaceId,
        search: searchQuery || undefined,
        filter: filterCompleted
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterCompleted]);

  const completedCount = tasks.filter(task => task.isCompleted).length;
  const totalCount = tasks.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <List className="w-4 h-4" />
            View All Tasks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCheck className="w-5 h-5" />
            All Tasks
            <Badge variant="secondary" className="ml-2">
              {completedCount}/{totalCount} completed
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4 space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterCompleted === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted('all')}
              >
                All ({totalCount})
              </Button>
              <Button
                variant={filterCompleted === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted('pending')}
              >
                Pending ({totalCount - completedCount})
              </Button>
              <Button
                variant={filterCompleted === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCompleted('completed')}
              >
                Completed ({completedCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshTasks}
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Tasks List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {loading && tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Loading tasks...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p className="text-destructive">Error loading tasks</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={refreshTasks}
                  >
                    Try Again
                  </Button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No tasks found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isCompleted = task.isCompleted;
                  
                  return (
                    <Card key={task.id} className={cn(
                      "transition-all duration-200 hover:shadow-md",
                      isCompleted && "opacity-75 bg-muted/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Completion Checkbox */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent"
                            onClick={() => completeTask(task.id)}
                            disabled={loading}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-green-600" />
                            )}
                          </Button>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-lg">{task.emoji}</span>
                                <h3 className={cn(
                                  "font-medium truncate",
                                  isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </h3>
                              </div>
                              
                              {/* Due Date */}
                              {task.taskDate && task.taskDate.from && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "shrink-0",
                                    new Date(task.taskDate.from) < new Date() && !isCompleted 
                                      ? "border-red-500 text-red-700" 
                                      : "border-blue-500 text-blue-700"
                                  )}
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(task.taskDate.from)}
                                </Badge>
                              )}
                            </div>

                            {/* Task Description */}
                            {task.content?.text && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.content.text}
                              </p>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.map((tag) => (
                                  <Badge 
                                    key={tag.id} 
                                    variant="secondary" 
                                    className="text-xs"
                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Assignees and Creator */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Created by:</span>
                                <div className="flex items-center gap-1">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={task.creator.image} />
                                    <AvatarFallback className="text-xs">
                                      {task.creator.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{task.creator.name}</span>
                                </div>
                              </div>

                              {task.assignedToTask && task.assignedToTask.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Assigned to:</span>
                                  <div className="flex -space-x-1">
                                    {task.assignedToTask.slice(0, 3).map((assigned, index) => (
                                      <Avatar key={assigned.user.id} className="w-5 h-5 border-2 border-background">
                                        <AvatarImage src={assigned.user.image} />
                                        <AvatarFallback className="text-xs">
                                          {assigned.user.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {task.assignedToTask.length > 3 && (
                                      <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                        <span className="text-xs">+{task.assignedToTask.length - 3}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {tasks.length} task(s)
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
