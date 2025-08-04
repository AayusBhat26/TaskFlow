'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Plus, 
  Calendar,
  Maximize2,
  Minimize2,
  Edit3,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  MapPin
} from 'lucide-react';

interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'DEEP_WORK' | 'MEETING' | 'BREAK' | 'EMAIL' | 'PLANNING' | 'LEARNING' | 'PERSONAL';
  color: string;
  taskId?: string;
  eventId?: string;
  isLocked: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  estimatedProductivity: number; // 1-10 scale
  actualProductivity?: number; // Set after completion
  notes?: string;
}

interface TimeBlockingProps {
  date: Date;
  timeBlocks: TimeBlock[];
  onTimeBlockCreate: (timeBlock: Partial<TimeBlock>) => void;
  onTimeBlockUpdate: (timeBlockId: string, updates: Partial<TimeBlock>) => void;
  onTimeBlockDelete: (timeBlockId: string) => void;
  workingHours: { start: number; end: number }; // 24-hour format
  timeSlotDuration: number; // minutes
  suggestions?: Array<{
    title: string;
    duration: number;
    type: TimeBlock['type'];
    priority: TimeBlock['priority'];
    bestTimes: Array<{ start: number; end: number; score: number }>;
  }>;
}

export function TimeBlocking({
  date,
  timeBlocks,
  onTimeBlockCreate,
  onTimeBlockUpdate,
  onTimeBlockDelete,
  workingHours = { start: 8, end: 18 },
  timeSlotDuration = 30,
  suggestions = []
}: TimeBlockingProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<TimeBlock | null>(null);
  const [isResizing, setIsResizing] = useState<{ blockId: string; edge: 'top' | 'bottom' } | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [showProductivityTracker, setShowProductivityTracker] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  const timeGridRef = useRef<HTMLDivElement>(null);

  const blockTypes = [
    { type: 'DEEP_WORK', label: 'Deep Work', color: '#3B82F6', description: 'Focused, uninterrupted work' },
    { type: 'MEETING', label: 'Meeting', color: '#10B981', description: 'Meetings and calls' },
    { type: 'BREAK', label: 'Break', color: '#6B7280', description: 'Rest and recharge' },
    { type: 'EMAIL', label: 'Email', color: '#F59E0B', description: 'Email and communication' },
    { type: 'PLANNING', label: 'Planning', color: '#8B5CF6', description: 'Planning and organization' },
    { type: 'LEARNING', label: 'Learning', color: '#EC4899', description: 'Learning and development' },
    { type: 'PERSONAL', label: 'Personal', color: '#EF4444', description: 'Personal tasks and activities' }
  ] as const;

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = workingHours.start;
    const endHour = workingHours.end;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + timeSlotDuration);
        
        slots.push({ start: slotStart, end: slotEnd });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if time slot is available
  const isSlotAvailable = (slotStart: Date, slotEnd: Date, excludeBlockId?: string) => {
    return !timeBlocks.some(block => {
      if (excludeBlockId && block.id === excludeBlockId) return false;
      
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      
      return (
        (slotStart >= blockStart && slotStart < blockEnd) ||
        (slotEnd > blockStart && slotEnd <= blockEnd) ||
        (slotStart <= blockStart && slotEnd >= blockEnd)
      );
    });
  };

  // Get block position and height
  const getBlockPosition = (block: TimeBlock) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(workingHours.start, 0, 0, 0);
    
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);
    
    const startOffset = (blockStart.getTime() - startOfDay.getTime()) / (1000 * 60); // minutes
    const duration = (blockEnd.getTime() - blockStart.getTime()) / (1000 * 60); // minutes
    
    const totalMinutes = (workingHours.end - workingHours.start) * 60;
    const slotHeight = 60; // pixels per hour
    
    const top = (startOffset / 60) * slotHeight;
    const height = (duration / 60) * slotHeight;
    
    return { top, height };
  };

  // Handle slot click
  const handleSlotClick = (slotStart: Date, slotEnd: Date) => {
    if (isSlotAvailable(slotStart, slotEnd)) {
      setSelectedSlot({ start: slotStart, end: slotEnd });
      setShowCreateModal(true);
    }
  };

  // Handle block drag
  const handleBlockDragStart = (block: TimeBlock) => {
    if (!block.isLocked) {
      setDraggedBlock(block);
    }
  };

  // Handle block drop
  const handleBlockDrop = (targetSlot: { start: Date; end: Date }) => {
    if (draggedBlock && isSlotAvailable(targetSlot.start, targetSlot.end, draggedBlock.id)) {
      const duration = draggedBlock.endTime.getTime() - draggedBlock.startTime.getTime();
      const newEndTime = new Date(targetSlot.start.getTime() + duration);
      
      onTimeBlockUpdate(draggedBlock.id, {
        startTime: targetSlot.start,
        endTime: newEndTime
      });
    }
    
    setDraggedBlock(null);
  };

  // Calculate productivity statistics
  const getProductivityStats = () => {
    const completedBlocksArray = timeBlocks.filter(block => 
      completedBlocks.has(block.id) && block.actualProductivity
    );
    
    if (completedBlocksArray.length === 0) {
      return { averageProductivity: 0, totalBlocks: 0, completedBlocks: 0 };
    }
    
    const averageProductivity = completedBlocksArray.reduce(
      (sum, block) => sum + (block.actualProductivity || 0), 0
    ) / completedBlocksArray.length;
    
    return {
      averageProductivity: Math.round(averageProductivity * 10) / 10,
      totalBlocks: timeBlocks.length,
      completedBlocks: completedBlocksArray.length
    };
  };

  const productivityStats = getProductivityStats();

  // Get time block overlap conflicts
  const getConflicts = () => {
    const conflicts = [];
    for (let i = 0; i < timeBlocks.length; i++) {
      for (let j = i + 1; j < timeBlocks.length; j++) {
        const block1 = timeBlocks[i];
        const block2 = timeBlocks[j];
        
        if (
          (block1.startTime < block2.endTime && block1.endTime > block2.startTime)
        ) {
          conflicts.push({ block1: block1.id, block2: block2.id });
        }
      }
    }
    return conflicts;
  };

  const conflicts = getConflicts();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Time Blocking - {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          {conflicts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <AlertCircle className="h-4 w-4" />
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Productivity Stats */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{productivityStats.completedBlocks}</span>
              <span className="text-gray-600">/{productivityStats.totalBlocks} completed</span>
            </div>
            {productivityStats.averageProductivity > 0 && (
              <div className="text-sm">
                <span className="font-medium">{productivityStats.averageProductivity}</span>
                <span className="text-gray-600">/10 avg productivity</span>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'compact' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Create Block Button */}
          <button
            onClick={() => {
              setSelectedSlot(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Block
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Time Grid */}
        <div className="flex-1 flex">
          {/* Time Labels */}
          <div className="w-20 border-r border-gray-200">
            {Array.from({ length: workingHours.end - workingHours.start }, (_, i) => {
              const hour = workingHours.start + i;
              return (
                <div key={hour} className="h-15 border-b border-gray-100 flex items-start pt-2 px-2">
                  <span className="text-sm text-gray-500 font-mono">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Slots and Blocks */}
          <div className="flex-1 relative" ref={timeGridRef}>
            {/* Time Slots */}
            <div className="absolute inset-0">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    isSlotAvailable(slot.start, slot.end) 
                      ? 'hover:bg-blue-50' 
                      : 'bg-gray-50'
                  }`}
                  style={{ height: `${60 / (60 / timeSlotDuration)}px` }}
                  onClick={() => handleSlotClick(slot.start, slot.end)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleBlockDrop(slot)}
                >
                  {/* Slot content */}
                </div>
              ))}
            </div>

            {/* Time Blocks */}
            <div className="absolute inset-0">
              {timeBlocks.map(block => {
                const { top, height } = getBlockPosition(block);
                const blockType = blockTypes.find(t => t.type === block.type);
                const isCompleted = completedBlocks.has(block.id);
                
                return (
                  <div
                    key={block.id}
                    className={`absolute left-2 right-2 rounded-lg border-2 cursor-move transition-all ${
                      block.isLocked ? 'cursor-not-allowed opacity-75' : ''
                    } ${
                      isCompleted ? 'border-green-500' : 'border-transparent'
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: blockType?.color + '20',
                      borderLeftColor: blockType?.color,
                      borderLeftWidth: '4px'
                    }}
                    draggable={!block.isLocked}
                    onDragStart={() => handleBlockDragStart(block)}
                  >
                    <div className="p-2 h-full flex flex-col">
                      {/* Block Header */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {block.title}
                          </h4>
                          {block.priority === 'URGENT' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          {block.priority === 'HIGH' && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newCompleted = new Set(completedBlocks);
                              if (isCompleted) {
                                newCompleted.delete(block.id);
                              } else {
                                newCompleted.add(block.id);
                              }
                              setCompletedBlocks(newCompleted);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition-all"
                          >
                            <CheckCircle className={`h-3 w-3 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Block Content */}
                      {viewMode === 'detailed' && height > 60 && (
                        <div className="flex-1 text-xs text-gray-600">
                          <div className="flex items-center justify-between mb-1">
                            <span>
                              {block.startTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })} - {block.endTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                            <span className="px-1 py-0.5 bg-white rounded text-xs">
                              {blockType?.label}
                            </span>
                          </div>
                          
                          {block.description && height > 80 && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {block.description}
                            </div>
                          )}

                          {block.tags.length > 0 && height > 100 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {block.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1 py-0.5 bg-white rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Productivity Indicator */}
                          {block.estimatedProductivity > 0 && height > 120 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-500">Expected:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 10 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full ${
                                      i < block.estimatedProductivity 
                                        ? 'bg-blue-500' 
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Block Types & Suggestions */}
        <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto">
          {/* Quick Block Types */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Add Blocks</h3>
            <div className="grid grid-cols-1 gap-2">
              {blockTypes.map(({ type, label, color, description }) => (
                <button
                  key={type}
                  onClick={() => {
                    const now = new Date();
                    const startTime = new Date(date);
                    startTime.setHours(now.getHours(), Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
                    const endTime = new Date(startTime);
                    endTime.setHours(endTime.getHours() + 1);
                    
                    setSelectedSlot({ start: startTime, end: endTime });
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">AI Suggestions</h3>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{suggestion.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        suggestion.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      Duration: {suggestion.duration} minutes
                    </div>
                    
                    <div className="space-y-1">
                      {suggestion.bestTimes.slice(0, 2).map((time, timeIndex) => (
                        <button
                          key={timeIndex}
                          onClick={() => {
                            const startTime = new Date(date);
                            startTime.setHours(time.start, 0, 0, 0);
                            const endTime = new Date(startTime);
                            endTime.setMinutes(endTime.getMinutes() + suggestion.duration);
                            
                            onTimeBlockCreate({
                              title: suggestion.title,
                              startTime,
                              endTime,
                              type: suggestion.type,
                              priority: suggestion.priority,
                              color: blockTypes.find(t => t.type === suggestion.type)?.color || '#3B82F6',
                              isLocked: false,
                              tags: [],
                              estimatedProductivity: Math.round(time.score)
                            });
                          }}
                          className="w-full text-left p-2 border border-gray-100 rounded hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-xs font-medium">
                            {time.start}:00 - {time.end}:00
                          </div>
                          <div className="text-xs text-green-600">
                            {Math.round(time.score * 10)}% optimal
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Block Modal */}
      {showCreateModal && (
        <TimeBlockModal
          timeBlock={null}
          initialSlot={selectedSlot}
          blockTypes={blockTypes}
          onSave={(blockData) => {
            onTimeBlockCreate(blockData);
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}

// Time Block Modal Component
interface TimeBlockModalProps {
  timeBlock: TimeBlock | null;
  initialSlot: { start: Date; end: Date } | null;
  blockTypes: typeof blockTypes;
  onSave: (blockData: Partial<TimeBlock>) => void;
  onClose: () => void;
}

function TimeBlockModal({ timeBlock, initialSlot, blockTypes, onSave, onClose }: TimeBlockModalProps) {
  const [formData, setFormData] = useState({
    title: timeBlock?.title || '',
    description: timeBlock?.description || '',
    type: timeBlock?.type || 'DEEP_WORK',
    startTime: timeBlock?.startTime || initialSlot?.start || new Date(),
    endTime: timeBlock?.endTime || initialSlot?.end || new Date(),
    priority: timeBlock?.priority || 'MEDIUM',
    estimatedProductivity: timeBlock?.estimatedProductivity || 8,
    tags: timeBlock?.tags?.join(', ') || ''
  });

  const handleSave = () => {
    const blockType = blockTypes.find(t => t.type === formData.type);
    
    onSave({
      ...formData,
      color: blockType?.color || '#3B82F6',
      isLocked: false,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {timeBlock ? 'Edit Time Block' : 'Create Time Block'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What will you work on?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {blockTypes.map(type => (
                  <option key={type.type} value={type.type}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime.toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime.toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Productivity (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.estimatedProductivity}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedProductivity: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {formData.estimatedProductivity}/10
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="frontend, urgent, client work"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {timeBlock ? 'Update' : 'Create'} Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
