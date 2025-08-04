'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Link, 
  Clock, 
  Flag, 
  User, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Repeat,
  MessageSquare,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isCompleted: boolean;
  completedAt?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: Date;
  isRecurring: boolean;
  recurringType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  assignees: Array<{ id: string; name: string; image?: string }>;
  tags: Array<{ id: string; name: string; color: string }>;
  dependsOn: Array<{ id: string; title: string; status: string }>;
  dependents: Array<{ id: string; title: string; status: string }>;
  subTasks: Array<{ id: string; title: string; isCompleted: boolean }>;
  comments: Array<{ id: string; content: string; author: string; createdAt: Date }>;
  timeEntries: Array<{ id: string; duration: number; description: string; date: Date }>;
}

interface TaskDependenciesProps {
  task: Task;
  allTasks: Task[];
  onUpdateDependencies: (taskId: string, dependencies: string[]) => void;
}

export function TaskDependencies({ task, allTasks, onUpdateDependencies }: TaskDependenciesProps) {
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    !task.dependsOn.some(dep => dep.id === t.id) &&
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDependency = (dependencyId: string) => {
    const newDependencies = [...task.dependsOn.map(d => d.id), dependencyId];
    onUpdateDependencies(task.id, newDependencies);
    setShowAddDependency(false);
    setSearchQuery('');
  };

  const handleRemoveDependency = (dependencyId: string) => {
    const newDependencies = task.dependsOn.filter(d => d.id !== dependencyId).map(d => d.id);
    onUpdateDependencies(task.id, newDependencies);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'CANCELLED':
        return <Square className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/70" />;
    }
  };

  const getDependencyStatus = () => {
    const blockedCount = task.dependsOn.filter(dep => dep.status !== 'DONE').length;
    return {
      isBlocked: blockedCount > 0,
      blockedCount,
      totalCount: task.dependsOn.length
    };
  };

  const dependencyStatus = getDependencyStatus();

  return (
    <div className="space-y-4">
      {/* Dependencies Status Summary */}
      {task.dependsOn.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          dependencyStatus.isBlocked 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            {dependencyStatus.isBlocked ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <span className={`text-sm font-medium ${
              dependencyStatus.isBlocked ? 'text-amber-700' : 'text-green-700'
            }`}>
              {dependencyStatus.isBlocked 
                ? `Blocked by ${dependencyStatus.blockedCount} task${dependencyStatus.blockedCount !== 1 ? 's' : ''}`
                : 'All dependencies completed'
              }
            </span>
          </div>
        </div>
      )}

      {/* Dependencies List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground">Dependencies</h4>
          <button
            onClick={() => setShowAddDependency(true)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Dependency
          </button>
        </div>

        {task.dependsOn.length > 0 ? (
          <div className="space-y-2">
            {task.dependsOn.map(dependency => (
              <div 
                key={dependency.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {getStatusIcon(dependency.status)}
                <div className="flex-1">
                  <span className={`text-sm ${
                    dependency.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {dependency.title}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveDependency(dependency.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            No dependencies. This task can be started anytime.
          </p>
        )}
      </div>

      {/* Dependents (tasks that depend on this one) */}
      {task.dependents.length > 0 && (
        <div>
          <h4 className="font-medium text-foreground mb-3">Dependent Tasks</h4>
          <div className="space-y-2">
            {task.dependents.map(dependent => (
              <div 
                key={dependent.id}
                className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg"
              >
                {getStatusIcon(dependent.status)}
                <div className="flex-1">
                  <span className="text-sm text-foreground">{dependent.title}</span>
                  <p className="text-xs text-muted-foreground">Waiting for this task to complete</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dependency Modal */}
      {showAddDependency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Add Dependency</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a task that must be completed before this one can start
              </p>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {availableTasks.length > 0 ? (
                availableTasks.map(availableTask => (
                  <button
                    key={availableTask.id}
                    onClick={() => handleAddDependency(availableTask.id)}
                    className="w-full p-3 text-left hover:bg-muted flex items-center gap-3"
                  >
                    {getStatusIcon(availableTask.status)}
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{availableTask.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {availableTask.status.replace('_', ' ').toLowerCase()}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No available tasks to add as dependencies
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddDependency(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskTimeTrackingProps {
  task: Task;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string, duration: number, description?: string) => void;
  onUpdateEstimate: (taskId: string, hours: number) => void;
}

export function TaskTimeTracking({ task, onStartTimer, onStopTimer, onUpdateEstimate }: TaskTimeTrackingProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEstimateEdit, setShowEstimateEdit] = useState(false);
  const [estimateInput, setEstimateInput] = useState(task.estimatedHours?.toString() || '');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const handleStartTimer = () => {
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    setElapsedTime(0);
    onStartTimer(task.id);
  };

  const handleStopTimer = () => {
    if (startTime) {
      const duration = (Date.now() - startTime.getTime()) / (1000 * 60 * 60); // Convert to hours
      onStopTimer(task.id, duration);
      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const handleUpdateEstimate = () => {
    const hours = parseFloat(estimateInput);
    if (!isNaN(hours) && hours >= 0) {
      onUpdateEstimate(task.id, hours);
    }
    setShowEstimateEdit(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!task.estimatedHours || task.estimatedHours === 0) return 0;
    return Math.min((task.actualHours || 0) / task.estimatedHours * 100, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">Time Tracking</h4>
        {isTracking && (
          <div className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
            {formatTime(elapsedTime)}
          </div>
        )}
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-2">
        {!isTracking ? (
          <button
            onClick={handleStartTimer}
            disabled={task.isCompleted}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4" />
            Start Timer
          </button>
        ) : (
          <button
            onClick={handleStopTimer}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Pause className="h-4 w-4" />
            Stop Timer
          </button>
        )}
      </div>

      {/* Time Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Estimated</div>
          <div className="flex items-center gap-2">
            {showEstimateEdit ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={estimateInput}
                  onChange={(e) => setEstimateInput(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border border-input rounded bg-background text-foreground"
                  min="0"
                  step="0.5"
                />
                <span className="text-sm text-muted-foreground">h</span>
                <button
                  onClick={handleUpdateEstimate}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}
                </span>
                <button
                  onClick={() => setShowEstimateEdit(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Actual</div>
          <div className="font-medium text-foreground">
            {task.actualHours ? `${task.actualHours.toFixed(1)}h` : '0h'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {task.estimatedHours && task.estimatedHours > 0 && (
        <div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{getProgressPercentage().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                getProgressPercentage() > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
            />
          </div>
          {getProgressPercentage() > 100 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              Over estimate by {((task.actualHours || 0) - task.estimatedHours).toFixed(1)}h
            </div>
          )}
        </div>
      )}

      {/* Recent Time Entries */}
      {task.timeEntries.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-foreground mb-2">Recent Time Entries</h5>
          <div className="space-y-1">
            {task.timeEntries.slice(0, 3).map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {entry.description || 'Work session'}
                </span>
                <span className="font-medium text-foreground">
                  {entry.duration.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubTasksProps {
  task: Task;
  onAddSubTask: (taskId: string, title: string) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  onDeleteSubTask: (taskId: string, subTaskId: string) => void;
}

export function SubTasks({ task, onAddSubTask, onToggleSubTask, onDeleteSubTask }: SubTasksProps) {
  const [showAddSubTask, setShowAddSubTask] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(task.id, newSubTaskTitle.trim());
      setNewSubTaskTitle('');
      setShowAddSubTask(false);
    }
  };

  const completedCount = task.subTasks.filter(st => st.isCompleted).length;
  const totalCount = task.subTasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">Sub-tasks</h4>
        <button
          onClick={() => setShowAddSubTask(true)}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Sub-task
        </button>
      </div>

      {/* Progress */}
      {totalCount > 0 && (
        <div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Sub-tasks List */}
      <div className="space-y-2">
        {task.subTasks.map(subTask => (
          <div key={subTask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
            <button
              onClick={() => onToggleSubTask(task.id, subTask.id)}
              className="flex-shrink-0"
            >
              {subTask.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <span className={`flex-1 text-sm ${
              subTask.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
              {subTask.title}
            </span>
            <button
              onClick={() => onDeleteSubTask(task.id, subTask.id)}
              className="text-muted-foreground hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add Sub-task Input */}
      {showAddSubTask && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubTask();
              if (e.key === 'Escape') setShowAddSubTask(false);
            }}
            placeholder="Enter sub-task title..."
            className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            autoFocus
          />
          <button
            onClick={handleAddSubTask}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddSubTask(false)}
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {totalCount === 0 && !showAddSubTask && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          No sub-tasks yet. Break this task down into smaller steps.
        </p>
      )}
    </div>
  );
}
