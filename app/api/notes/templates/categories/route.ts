import { NextResponse } from 'next/server';

// GET /api/notes/templates/categories - Get template categories
export async function GET() {
  try {
    const categories = [
      { name: 'Meeting Notes', description: 'Templates for various types of meetings' },
      { name: 'Project Planning', description: 'Project management and planning templates' },
      { name: 'Daily Journal', description: 'Personal journaling and reflection templates' },
      { name: 'Brainstorming', description: 'Creative thinking and ideation templates' },
      { name: 'Task Management', description: 'Task lists and productivity templates' },
      { name: 'Learning', description: 'Educational and learning-focused templates' },
      { name: 'Documentation', description: 'Technical and process documentation templates' },
      { name: 'Research', description: 'Research notes and analysis templates' },
      { name: 'Personal', description: 'Personal life organization templates' },
      { name: 'Business', description: 'Business planning and strategy templates' }
    ];

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}