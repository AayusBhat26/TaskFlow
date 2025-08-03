import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { noteId: string; blockId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify note and block ownership
    const block = await db.noteBlock.findFirst({
      where: {
        id: params.blockId,
        noteId: params.noteId,
        note: {
          authorId: session.user.id,
        }
      }
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, content, position, parentId } = body;

    const updatedBlock = await db.noteBlock.update({
      where: {
        id: params.blockId,
      },
      data: {
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(position !== undefined && { position }),
        ...(parentId !== undefined && { parentId }),
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

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error updating note block:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string; blockId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify note and block ownership
    const block = await db.noteBlock.findFirst({
      where: {
        id: params.blockId,
        noteId: params.noteId,
        note: {
          authorId: session.user.id,
        }
      }
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    await db.noteBlock.delete({
      where: {
        id: params.blockId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note block:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
