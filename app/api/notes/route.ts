import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

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

    const notes = await db.note.findMany({
      where: {
        authorId: session.user.id,
        ...(workspaceId && { workspaceId }),
        isArchived,
        ...(isFavorite && { isFavorite: true }),
        parentId: null, // Only root-level notes
      },
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
    const { title, icon, coverImage, workspaceId, parentId, isPublic } = body;

    const note = await db.note.create({
      data: {
        title: title || 'Untitled',
        icon: icon || '📝',
        coverImage,
        workspaceId,
        parentId,
        isPublic: isPublic || false,
        authorId: session.user.id,
        position: 0, // Will be updated based on current notes count
      },
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
      }
    });

    // Create initial empty text block
    await db.noteBlock.create({
      data: {
        noteId: note.id,
        type: 'TEXT',
        content: '',
        position: 0,
        createdById: session.user.id,
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
