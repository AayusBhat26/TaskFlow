import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Enhanced note schemas
const createNoteSchema = z.object({
  title: z.string().min(1),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  workspaceId: z.string().optional(),
  parentId: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  content: z.array(z.object({
    id: z.string(),
    type: z.enum(['TEXT', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'BULLET_LIST', 'NUMBERED_LIST', 'TODO', 'QUOTE', 'CODE', 'TABLE', 'DIVIDER', 'IMAGE', 'CALLOUT', 'TOGGLE']),
    content: z.string(),
    children: z.array(z.any()).optional(),
    metadata: z.record(z.any()).optional()
  })).optional(),
  templateId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const isArchived = searchParams.get('archived') === 'true';
    const isFavorite = searchParams.get('favorite') === 'true';
    const search = searchParams.get('search');

    let where: any = {
      authorId: session.user.id,
      parentId: null, // Only root-level notes
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    where.isArchived = isArchived;

    if (isFavorite) {
      where.isFavorite = true;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          blocks: {
            some: {
              content: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    const notes = await db.note.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        workspace: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            icon: true,
            position: true,
          },
          orderBy: {
            position: 'asc'
          }
        },
        _count: {
          select: {
            blocks: true,
            children: true,
          }
        }
      },
      orderBy: [
        { isFavorite: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createNoteSchema.parse(body);

    // Create note with transaction to handle tags and blocks
    const note = await db.$transaction(async (tx) => {
      const newNote = await tx.note.create({
        data: {
          title: data.title || 'Untitled',
          icon: data.icon || '📝',
          coverImage: data.coverImage,
          workspaceId: data.workspaceId,
          parentId: data.parentId,
          isPublic: data.isPublic || false,
          authorId: session.user.id,
          position: 0, // Will be updated based on current notes count
          templateId: data.templateId
        }
      });

      // Handle tags - using direct relation
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          await tx.noteTag.create({
            data: {
              name: tagName,
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              noteId: newNote.id
            }
          });
        }
      }

      // Create blocks from content or initial empty block
      if (data.content && data.content.length > 0) {
        for (let i = 0; i < data.content.length; i++) {
          const block = data.content[i];
          await tx.noteBlock.create({
            data: {
              noteId: newNote.id,
              type: block.type,
              content: block.content,
              position: i,
              createdById: session.user.id,
            }
          });
        }
      } else {
        // Create initial empty text block
        await tx.noteBlock.create({
          data: {
            noteId: newNote.id,
            type: 'TEXT',
            content: '',
            position: 0,
            createdById: session.user.id,
          }
        });
      }

      // Create history entry
      await tx.noteHistory.create({
        data: {
          noteId: newNote.id,
          content: JSON.stringify(data.content || []),
          title: data.title || 'Untitled',
          version: 1,
          changeBy: session.user.id
        }
      });

      return newNote;
    });

    // Fetch the created note with all relations
    const fullNote = await db.note.findUnique({
      where: { id: note.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        workspace: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            icon: true,
            position: true,
          },
          orderBy: {
            position: 'asc'
          }
        },
        tags: true,
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        },
        links: {
          include: {
            targetNote: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        linkedBy: {
          include: {
            sourceNote: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            blocks: true,
            children: true,
            history: true
          }
        }
      }
    });

    return NextResponse.json(fullNote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
