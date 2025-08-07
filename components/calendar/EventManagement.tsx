'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Tag, 
  Repeat,
  Bell,
  Video,
  Link,
  X,
  Plus,
  Edit3,
  Trash2
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
  attendees: Array<{ 
    id: string; 
    name: string; 
    email: string; 
    status: 'ACCEPTED' | 'DECLINED' | 'PENDING' 
  }>;
  taskId?: string;
  recurringPattern?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    endDate?: Date;
  };
  reminders: Array<{
    type: 'EMAIL' | 'NOTIFICATION' | 'SMS';
    minutesBefore: number;
  }>;
  meetingLink?: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface EventManagementProps {
  event?: CalendarEvent;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
  availableUsers: Array<{ id: string; name: string; email: string; avatar?: string }>;
  suggestedTimes?: Array<{ startTime: Date; endTime: Date; confidence: number }>;
}

export function EventManagement({ 
  event, 
  onSave, 
  onDelete, 
  onClose, 
  availableUsers,
  suggestedTimes = []
}: EventManagementProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: event?.title || '',
    description: event?.description || '',
    startTime: event?.startTime || new Date(),
    endTime: event?.endTime || new Date(Date.now() + 60 * 60 * 1000),
    allDay: event?.allDay || false,
    type: event?.type || 'MEETING',
    color: event?.color || '#3B82F6',
    location: event?.location || '',
    attendees: event?.attendees || [],
    taskId: event?.taskId,
    recurringPattern: event?.recurringPattern,
    reminders: event?.reminders || [{ type: 'NOTIFICATION', minutesBefore: 15 }],
    meetingLink: event?.meetingLink || '',
    attachments: event?.attachments || []
  });

  const [activeTab, setActiveTab] = useState<'details' | 'attendees' | 'recurring' | 'reminders'>('details');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventTypes = [
    { type: 'MEETING', label: 'Meeting', color: '#3B82F6', icon: Users },
    { type: 'DEADLINE', label: 'Deadline', color: '#EF4444', icon: Clock },
    { type: 'REMINDER', label: 'Reminder', color: '#F59E0B', icon: Bell },
    { type: 'PERSONAL', label: 'Personal', color: '#10B981', icon: Calendar },
    { type: 'WORK', label: 'Work', color: '#8B5CF6', icon: Calendar },
    { type: 'BREAK', label: 'Break', color: '#6B7280', icon: Calendar },
    { type: 'FOCUS_TIME', label: 'Focus Time', color: '#EC4899', icon: Calendar }
  ];

  const reminderTypes = [
    { type: 'NOTIFICATION', label: 'Browser Notification' },
    { type: 'EMAIL', label: 'Email' },
    { type: 'SMS', label: 'SMS' }
  ];

  const reminderOptions = [
    { value: 0, label: 'At time of event' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' },
    { value: 10080, label: '1 week before' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const addAttendee = (user: { id: string; name: string; email: string }) => {
    if (!formData.attendees?.find(a => a.id === user.id)) {
      setFormData(prev => ({
        ...prev,
        attendees: [
          ...(prev.attendees || []),
          { ...user, status: 'PENDING' as const }
        ]
      }));
    }
    setShowUserSearch(false);
    setUserSearchQuery('');
  };

  const removeAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.id !== userId) || []
    }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [
        ...(prev.reminders || []),
        { type: 'NOTIFICATION', minutesBefore: 15 }
      ]
    }));
  };

  const updateReminder = (index: number, updates: Partial<{ type: 'EMAIL' | 'NOTIFICATION' | 'SMS'; minutesBefore: number }>) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders?.map((reminder, i) =>
        i === index
          ? {
              ...reminder,
              ...updates,
              type: updates.type ?? reminder.type,
            }
          : reminder
      ) || []
    }));
  };

  const removeReminder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'details', label: 'Details', icon: Edit3 },
                { id: 'attendees', label: 'Attendees', icon: Users },
                { id: 'recurring', label: 'Recurring', icon: Repeat },
                { id: 'reminders', label: 'Reminders', icon: Bell }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Event title"
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Event description"
                      />
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {eventTypes.map(({ type, label, color, icon: Icon }) => (
                          <button
                            key={type}
                            onClick={() => setFormData(prev => ({ ...prev, type: type as any, color }))}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                              formData.type === type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" style={{ color }} />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time & Date */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="allDay"
                        checked={formData.allDay || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, allDay: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                        All day event
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time *
                        </label>
                        <input
                          type={formData.allDay ? 'date' : 'datetime-local'}
                          value={formData.allDay 
                            ? formData.startTime?.toISOString().split('T')[0] 
                            : formatDateTime(formData.startTime || new Date())
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setFormData(prev => ({ ...prev, startTime: newDate }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.startTime ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.startTime && (
                          <p className="text-sm text-red-600 mt-1">{errors.startTime}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time *
                        </label>
                        <input
                          type={formData.allDay ? 'date' : 'datetime-local'}
                          value={formData.allDay 
                            ? formData.endTime?.toISOString().split('T')[0] 
                            : formatDateTime(formData.endTime || new Date())
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setFormData(prev => ({ ...prev, endTime: newDate }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.endTime ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.endTime && (
                          <p className="text-sm text-red-600 mt-1">{errors.endTime}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location & Links */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meeting location or address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Video className="h-4 w-4 inline mr-1" />
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        value={formData.meetingLink || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendees' && (
                <div className="space-y-6">
                  {/* Add Attendees */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserSearch(!showUserSearch)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Attendees
                    </button>

                    {showUserSearch && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="p-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredUsers.map(user => (
                            <button
                              key={user.id}
                              onClick={() => addAttendee(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Attendees */}
                  <div className="space-y-3">
                    {formData.attendees?.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{attendee.name}</div>
                            <div className="text-sm text-gray-500">{attendee.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendee.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            attendee.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendee.status}
                          </span>
                          <button
                            onClick={() => removeAttendee(attendee.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {!formData.attendees?.length && (
                      <div className="text-center py-8 text-gray-500">
                        No attendees added yet
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'recurring' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={!!formData.recurringPattern}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            recurringPattern: {
                              frequency: 'WEEKLY',
                              interval: 1
                            }
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, recurringPattern: undefined }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Make this a recurring event
                    </label>
                  </div>

                  {formData.recurringPattern && (
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <select
                            value={formData.recurringPattern.frequency}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              recurringPattern: {
                                ...prev.recurringPattern!,
                                frequency: e.target.value as any
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Every
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={formData.recurringPattern.interval}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                recurringPattern: {
                                  ...prev.recurringPattern!,
                                  interval: parseInt(e.target.value) || 1
                                }
                              }))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">
                              {formData.recurringPattern.frequency.toLowerCase()}(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date (optional)
                        </label>
                        <input
                          type="date"
                          value={formData.recurringPattern.endDate?.toISOString().split('T')[0] || ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            setFormData(prev => ({
                              ...prev,
                              recurringPattern: {
                                ...prev.recurringPattern!,
                                endDate: date
                              }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Event Reminders</h3>
                    <button
                      onClick={addReminder}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Reminder
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.reminders?.map((reminder, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <select
                            value={reminder.type}
                            onChange={(e) => updateReminder(index, { type: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {reminderTypes.map(type => (
                              <option key={type.type} value={type.type}>
                                {type.label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={reminder.minutesBefore}
                            onChange={(e) => updateReminder(index, { minutesBefore: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {reminderOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => removeReminder(index)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    ))}

                    {!formData.reminders?.length && (
                      <div className="text-center py-8 text-gray-500">
                        No reminders set
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Suggested Times */}
          {suggestedTimes.length > 0 && (
            <div className="w-80 border-l border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Times</h3>
              <div className="space-y-3">
                {suggestedTimes.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        startTime: suggestion.startTime,
                        endTime: suggestion.endTime
                      }));
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {suggestion.startTime.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {suggestion.startTime.toLocaleTimeString()} - {suggestion.endTime.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {event && onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Event
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
