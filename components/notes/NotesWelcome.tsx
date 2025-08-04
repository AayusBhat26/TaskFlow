'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Plus,
  BookOpen,
  Star,
  Zap,
  Target
} from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username: string;
}

interface NotesWelcomeProps {
  currentUser: CurrentUser;
  onCreateNote: (noteData: Partial<any>) => void;
}

export function NotesWelcome({ currentUser, onCreateNote }: NotesWelcomeProps) {
  const handleCreateNote = (template?: string) => {
    const templates = {
      blank: {
        title: 'Untitled',
        icon: '📝',
      },
      meeting: {
        title: 'Meeting Notes',
        icon: '📋',
      },
      project: {
        title: 'Project Plan',
        icon: '🎯',
      },
      journal: {
        title: 'Daily Journal',
        icon: '📔',
      },
    };

    const noteData = templates[template as keyof typeof templates] || templates.blank;
    onCreateNote(noteData);
  };

  const quickActions = [
    {
      icon: FileText,
      title: 'Blank Note',
      description: 'Start with a clean slate',
      onClick: () => handleCreateNote('blank'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Meeting Notes',
      description: 'Template for meeting minutes',
      onClick: () => handleCreateNote('meeting'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: Target,
      title: 'Project Plan',
      description: 'Organize your project goals',
      onClick: () => handleCreateNote('project'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: Star,
      title: 'Daily Journal',
      description: 'Reflect on your day',
      onClick: () => handleCreateNote('journal'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Rich Text Editor',
      description: 'Format your text with headers, lists, quotes, and more'
    },
    {
      icon: FileText,
      title: 'Block-based Writing',
      description: 'Organize content in flexible, moveable blocks'
    },
    {
      icon: Star,
      title: 'Favorites & Organization',
      description: 'Keep your important notes easily accessible'
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Header */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Notes, {currentUser.name || currentUser.username}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Capture ideas, organize thoughts, and create beautiful documents with our 
              Notion-inspired editor. Start with a template or create a blank note.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Create your first note
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="group p-6 bg-card border-2 border-border rounded-xl hover:border-border/80 hover:shadow-lg transition-all duration-200 text-left"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Powerful features for better writing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-8 border-t border-gray-200">
            <Button
              onClick={() => handleCreateNote('blank')}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
