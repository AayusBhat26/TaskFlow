import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify note ownership
    const note = await db.note.findFirst({
      where: {
        id: params.noteId,
        authorId: session.user.id,
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const blocks = await db.noteBlock.findMany({
      where: {
        noteId: params.noteId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      },
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching note blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify note ownership
    const note = await db.note.findFirst({
      where: {
        id: params.noteId,
        authorId: session.user.id,
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, content, position, parentId } = body;

    // Get the highest position to place new block at the end
    const lastBlock = await db.noteBlock.findFirst({
      where: {
        noteId: params.noteId,
        parentId: parentId || null,
      },
      orderBy: {
        position: 'desc'
      }
    });

    const newPosition = position !== undefined ? position : (lastBlock?.position || 0) + 1;

    const block = await db.noteBlock.create({
      data: {
        noteId: params.noteId,
        type: type || 'TEXT',
        content: content || '',
        position: newPosition,
        parentId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('Error creating note block:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
