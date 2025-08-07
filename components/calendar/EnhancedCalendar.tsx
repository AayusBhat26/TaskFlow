'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin,
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Settings
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  type: 'MEETING' | 'DEADLINE' | 'REMINDER' | 'PERSONAL' | 'WORK' | 'BREAK' | 'FOCUS_TIME';
  color: string;
  location?: string;
  attendees: Array<{ id: string; name: string; email: string; status: 'ACCEPTED' | 'DECLINED' | 'PENDING' }>;
  taskId?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date, endTime: Date) => void;
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onEventDelete: (eventId: string) => void;
}

type ViewType = 'month' | 'week' | 'day' | 'agenda';

export function EnhancedCalendar({ 
  events, 
  onEventClick, 
  onEventCreate, 
  onEventUpdate, 
  onEventDelete 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const eventTypes = [
    { type: 'MEETING', label: 'Meeting', color: '#3B82F6' },
    { type: 'DEADLINE', label: 'Deadline', color: '#EF4444' },
    { type: 'REMINDER', label: 'Reminder', color: '#F59E0B' },
    { type: 'PERSONAL', label: 'Personal', color: '#10B981' },
    { type: 'WORK', label: 'Work', color: '#8B5CF6' },
    { type: 'BREAK', label: 'Break', color: '#6B7280' },
    { type: 'FOCUS_TIME', label: 'Focus Time', color: '#EC4899' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(event.type);
    return matchesSearch && matchesType;
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const handleEventDrop = (eventId: string, newStartTime: Date) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const duration = event.endTime.getTime() - event.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);
      onEventUpdate(eventId, { startTime: newStartTime, endTime: newEndTime });
    }
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long' 
    };
    
    switch (viewType) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', options);
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'agenda':
        return 'Agenda View';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-lg font-medium text-gray-900">
            {formatDateRange()}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* View Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { type: 'month', icon: Grid3X3, label: 'Month' },
              { type: 'week', icon: List, label: 'Week' },
              { type: 'day', icon: CalendarIcon, label: 'Day' },
              { type: 'agenda', icon: List, label: 'Agenda' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setViewType(type as ViewType)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Create Event */}
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowEventModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {eventTypes.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => {
                const newSelected = new Set(selectedTypes);
                if (newSelected.has(type)) {
                  newSelected.delete(type);
                } else {
                  newSelected.add(type);
                }
                setSelectedTypes(newSelected);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTypes.has(type) || selectedTypes.size === 0
                  ? 'text-white'
                  : 'text-gray-600 bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedTypes.has(type) || selectedTypes.size === 0 ? color : undefined
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {selectedTypes.size > 0 && (
          <button
            onClick={() => setSelectedTypes(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Calendar Views */}
      <div className="flex-1 overflow-hidden">
        {viewType === 'month' && (
          <MonthView 
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={onEventClick}
            onEventCreate={onEventCreate}
            onEventDrop={handleEventDrop}
          />
        )}
        {viewType === 'week' && (
          <WeekView 
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={onEventClick}
            onEventCreate={onEventCreate}
            onEventDrop={handleEventDrop}
          />
        )}
        {viewType === 'day' && (
          <DayView 
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={onEventClick}
            onEventCreate={onEventCreate}
            onEventDrop={handleEventDrop}
          />
        )}
        {viewType === 'agenda' && (
          <AgendaView 
            events={filteredEvents}
            onEventClick={onEventClick}
          />
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onSave={(eventData: Partial<CalendarEvent>) => {
            if (selectedEvent) {
              onEventUpdate(selectedEvent.id, eventData);
            } else {
              // Create new event logic
              if (eventData.startTime && eventData.endTime) {
                onEventCreate(eventData.startTime, eventData.endTime);
              }
            }
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onDelete={() => {
            if (selectedEvent) {
              onEventDelete(selectedEvent.id);
              setShowEventModal(false);
              setSelectedEvent(null);
            }
          }}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

// Month View Component
function MonthView({ currentDate, events, onEventClick, onEventCreate, onEventDrop }: any) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day, index) => (
          <div
            key={index}
            className="border-r border-b border-gray-200 p-2 min-h-[120px] hover:bg-gray-50 transition-colors"
            onClick={() => {
              if (day) {
                const startTime = new Date(day);
                startTime.setHours(9, 0, 0, 0);
                const endTime = new Date(day);
                endTime.setHours(10, 0, 0, 0);
                onEventCreate(startTime, endTime);
              }
            }}
          >
            {day && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                  day.toDateString() === new Date().toDateString() 
                    ? 'text-blue-600' 
                    : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {getEventsForDay(day).slice(0, 3).map((event: CalendarEvent) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color, color: 'white' }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {getEventsForDay(day).length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{getEventsForDay(day).length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Week View Component (simplified)
function WeekView({ currentDate, events, onEventClick, onEventCreate }: any) {
  return (
    <div className="h-full p-4">
      <div className="text-center text-gray-500">
        Week view implementation would go here
      </div>
    </div>
  );
}

// Day View Component (simplified)
function DayView({ currentDate, events, onEventClick, onEventCreate }: any) {
  return (
    <div className="h-full p-4">
      <div className="text-center text-gray-500">
        Day view implementation would go here
      </div>
    </div>
  );
}

// Agenda View Component (simplified)
function AgendaView({ events, onEventClick }: any) {
  return (
    <div className="h-full p-4">
      <div className="text-center text-gray-500">
        Agenda view implementation would go here
      </div>
    </div>
  );
}

// Event Modal Component (simplified)
function EventModal({ event, onSave, onDelete, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-medium mb-4">
          {event ? 'Edit Event' : 'Create Event'}
        </h3>
        <div className="text-center text-gray-500">
          Event modal implementation would go here
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
