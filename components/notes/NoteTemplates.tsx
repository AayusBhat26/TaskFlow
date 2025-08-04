'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Target, 
  Users, 
  Lightbulb, 
  CheckSquare,
  Plus,
  X,
  Search
} from 'lucide-react';

interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  blocks: any[];
}

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onClose: () => void;
}

const noteTemplates: NoteTemplate[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured template for meeting documentation',
    category: 'Business',
    icon: <Users className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: 'Meeting Notes - [Date]' },
        position: 0
      },
      {
        id: 'attendees',
        type: 'HEADING_3',
        content: { text: 'Attendees' },
        position: 1
      },
      {
        id: 'attendees-list',
        type: 'BULLET_LIST',
        content: { text: 'Add attendee names...' },
        position: 2
      },
      {
        id: 'agenda',
        type: 'HEADING_3',
        content: { text: 'Agenda' },
        position: 3
      },
      {
        id: 'agenda-items',
        type: 'NUMBERED_LIST',
        content: { text: 'First agenda item...' },
        position: 4
      },
      {
        id: 'discussion',
        type: 'HEADING_3',
        content: { text: 'Discussion Points' },
        position: 5
      },
      {
        id: 'discussion-content',
        type: 'TEXT',
        content: { text: 'Key discussion points and decisions...' },
        position: 6
      },
      {
        id: 'action-items',
        type: 'HEADING_3',
        content: { text: 'Action Items' },
        position: 7
      },
      {
        id: 'actions',
        type: 'TODO',
        content: { text: 'First action item...', checked: false },
        position: 8
      },
      {
        id: 'next-meeting',
        type: 'HEADING_3',
        content: { text: 'Next Meeting' },
        position: 9
      },
      {
        id: 'next-date',
        type: 'TEXT',
        content: { text: 'Date: TBD\nTime: TBD\nLocation: TBD' },
        position: 10
      }
    ]
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Comprehensive project planning template',
    category: 'Planning',
    icon: <Target className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: 'Project Plan: [Project Name]' },
        position: 0
      },
      {
        id: 'overview',
        type: 'HEADING_2',
        content: { text: 'Project Overview' },
        position: 1
      },
      {
        id: 'description',
        type: 'TEXT',
        content: { text: 'Brief description of the project...' },
        position: 2
      },
      {
        id: 'objectives',
        type: 'HEADING_2',
        content: { text: 'Objectives' },
        position: 3
      },
      {
        id: 'obj-list',
        type: 'NUMBERED_LIST',
        content: { text: 'Primary objective...' },
        position: 4
      },
      {
        id: 'scope',
        type: 'HEADING_2',
        content: { text: 'Project Scope' },
        position: 5
      },
      {
        id: 'in-scope',
        type: 'HEADING_3',
        content: { text: 'In Scope' },
        position: 6
      },
      {
        id: 'in-scope-list',
        type: 'BULLET_LIST',
        content: { text: 'Feature/deliverable...' },
        position: 7
      },
      {
        id: 'out-scope',
        type: 'HEADING_3',
        content: { text: 'Out of Scope' },
        position: 8
      },
      {
        id: 'out-scope-list',
        type: 'BULLET_LIST',
        content: { text: 'Excluded feature...' },
        position: 9
      },
      {
        id: 'timeline',
        type: 'HEADING_2',
        content: { text: 'Timeline & Milestones' },
        position: 10
      },
      {
        id: 'milestones',
        type: 'TODO',
        content: { text: 'Phase 1: Planning (Week 1-2)', checked: false },
        position: 11
      },
      {
        id: 'resources',
        type: 'HEADING_2',
        content: { text: 'Resources & Team' },
        position: 12
      },
      {
        id: 'team-list',
        type: 'BULLET_LIST',
        content: { text: 'Team member - Role' },
        position: 13
      },
      {
        id: 'risks',
        type: 'HEADING_2',
        content: { text: 'Risks & Mitigation' },
        position: 14
      },
      {
        id: 'risk-callout',
        type: 'CALLOUT',
        content: { text: 'Identify potential risks and mitigation strategies...' },
        position: 15
      }
    ]
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Personal daily reflection and planning',
    category: 'Personal',
    icon: <Calendar className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) },
        position: 0
      },
      {
        id: 'mood',
        type: 'TEXT',
        content: { text: '🌤️ Today\'s mood: ' },
        position: 1
      },
      {
        id: 'gratitude',
        type: 'HEADING_3',
        content: { text: 'Gratitude' },
        position: 2
      },
      {
        id: 'grateful-for',
        type: 'BULLET_LIST',
        content: { text: 'Something I\'m grateful for...' },
        position: 3
      },
      {
        id: 'priorities',
        type: 'HEADING_3',
        content: { text: 'Today\'s Priorities' },
        position: 4
      },
      {
        id: 'priority-list',
        type: 'TODO',
        content: { text: 'Most important task...', checked: false },
        position: 5
      },
      {
        id: 'highlights',
        type: 'HEADING_3',
        content: { text: 'Highlights' },
        position: 6
      },
      {
        id: 'highlight-content',
        type: 'TEXT',
        content: { text: 'Best moments of the day...' },
        position: 7
      },
      {
        id: 'challenges',
        type: 'HEADING_3',
        content: { text: 'Challenges' },
        position: 8
      },
      {
        id: 'challenge-content',
        type: 'TEXT',
        content: { text: 'Difficulties faced and lessons learned...' },
        position: 9
      },
      {
        id: 'tomorrow',
        type: 'HEADING_3',
        content: { text: 'Tomorrow\'s Focus' },
        position: 10
      },
      {
        id: 'tomorrow-list',
        type: 'BULLET_LIST',
        content: { text: 'Key focus area...' },
        position: 11
      }
    ]
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming Session',
    description: 'Creative ideation and brainstorming framework',
    category: 'Creative',
    icon: <Lightbulb className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: 'Brainstorming: [Topic]' },
        position: 0
      },
      {
        id: 'problem',
        type: 'HEADING_2',
        content: { text: 'Problem Statement' },
        position: 1
      },
      {
        id: 'problem-desc',
        type: 'CALLOUT',
        content: { text: 'Clearly define the problem we\'re trying to solve...' },
        position: 2
      },
      {
        id: 'goals',
        type: 'HEADING_2',
        content: { text: 'Session Goals' },
        position: 3
      },
      {
        id: 'goal-list',
        type: 'BULLET_LIST',
        content: { text: 'Generate 20+ ideas' },
        position: 4
      },
      {
        id: 'rules',
        type: 'HEADING_2',
        content: { text: 'Brainstorming Rules' },
        position: 5
      },
      {
        id: 'rules-list',
        type: 'NUMBERED_LIST',
        content: { text: 'No criticism or judgment' },
        position: 6
      },
      {
        id: 'ideas',
        type: 'HEADING_2',
        content: { text: 'Ideas' },
        position: 7
      },
      {
        id: 'idea-1',
        type: 'BULLET_LIST',
        content: { text: 'First idea...' },
        position: 8
      },
      {
        id: 'evaluation',
        type: 'HEADING_2',
        content: { text: 'Idea Evaluation' },
        position: 9
      },
      {
        id: 'criteria',
        type: 'HEADING_3',
        content: { text: 'Evaluation Criteria' },
        position: 10
      },
      {
        id: 'criteria-list',
        type: 'BULLET_LIST',
        content: { text: 'Feasibility' },
        position: 11
      },
      {
        id: 'top-ideas',
        type: 'HEADING_3',
        content: { text: 'Top Ideas' },
        position: 12
      },
      {
        id: 'ranked-ideas',
        type: 'NUMBERED_LIST',
        content: { text: 'Best idea with rationale...' },
        position: 13
      }
    ]
  },
  {
    id: 'task-list',
    name: 'Task List',
    description: 'Simple task tracking and organization',
    category: 'Productivity',
    icon: <CheckSquare className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: 'Tasks - [Date/Project]' },
        position: 0
      },
      {
        id: 'urgent',
        type: 'HEADING_2',
        content: { text: '🔥 Urgent' },
        position: 1
      },
      {
        id: 'urgent-tasks',
        type: 'TODO',
        content: { text: 'High priority task...', checked: false },
        position: 2
      },
      {
        id: 'important',
        type: 'HEADING_2',
        content: { text: '⭐ Important' },
        position: 3
      },
      {
        id: 'important-tasks',
        type: 'TODO',
        content: { text: 'Important but not urgent...', checked: false },
        position: 4
      },
      {
        id: 'routine',
        type: 'HEADING_2',
        content: { text: '📝 Routine' },
        position: 5
      },
      {
        id: 'routine-tasks',
        type: 'TODO',
        content: { text: 'Regular maintenance task...', checked: false },
        position: 6
      },
      {
        id: 'someday',
        type: 'HEADING_2',
        content: { text: '💭 Someday/Maybe' },
        position: 7
      },
      {
        id: 'someday-tasks',
        type: 'TODO',
        content: { text: 'Future consideration...', checked: false },
        position: 8
      },
      {
        id: 'completed',
        type: 'HEADING_2',
        content: { text: '✅ Completed' },
        position: 9
      },
      {
        id: 'completed-tasks',
        type: 'TODO',
        content: { text: 'Finished task example', checked: true },
        position: 10
      }
    ]
  },
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with a clean slate',
    category: 'Basic',
    icon: <FileText className="h-5 w-5" />,
    blocks: [
      {
        id: 'title',
        type: 'HEADING_1',
        content: { text: 'Untitled' },
        position: 0
      },
      {
        id: 'content',
        type: 'TEXT',
        content: { text: '' },
        position: 1
      }
    ]
  }
];

const categories = Array.from(new Set(noteTemplates.map(t => t.category)));

export function NoteTemplates({ onSelectTemplate, onClose }: NoteTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = noteTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Choose a Template</h2>
            <p className="text-gray-600 mt-1">Start with a pre-built structure</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSelectTemplate(noteTemplates.find(t => t.id === 'blank')!)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Start Blank
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
