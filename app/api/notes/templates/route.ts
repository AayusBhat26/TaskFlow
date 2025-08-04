import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.array(z.object({
    id: z.string(),
    type: z.enum(['TEXT', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'BULLET_LIST', 'NUMBERED_LIST', 'TODO', 'QUOTE', 'CODE', 'TABLE', 'DIVIDER', 'IMAGE', 'CALLOUT', 'TOGGLE']),
    content: z.string(),
    children: z.array(z.any()).optional(),
    metadata: z.record(z.any()).optional()
  })),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  icon: z.string().optional(),
  previewImage: z.string().optional()
});

// GET /api/notes/templates - Get note templates
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includePublic = searchParams.get('includePublic') === 'true';

    const where: any = {
      OR: [
        { authorId: session.user.id }
      ]
    };

    if (includePublic) {
      where.OR.push({ isPublic: true });
    }

    if (category) {
      where.category = category;
    }

    const templates = await db.noteTemplate.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        _count: {
          select: {
            usages: true
          }
        }
      },
      orderBy: [
        { isPremium: 'asc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching note templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/notes/templates - Create note template
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const template = await db.noteTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        content: data.content,
        category: data.category || 'General',
        tags: data.tags || [],
        isPublic: data.isPublic || false,
        icon: data.icon || '📝',
        previewImage: data.previewImage,
        authorId: session.user.id,
        usageCount: 0
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// GET /api/notes/templates/categories - Get template categories
export async function GET_CATEGORIES() {
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
}
