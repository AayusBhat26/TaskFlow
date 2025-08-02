import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user has access to workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          { 
            subscribers: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }

    // Get messages for the workspace
    const messages = await db.chatMessage.findMany({
      where: {
        workspaceId: workspaceId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Reverse to get chronological order (oldest first)
    const sortedMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      messages: sortedMessages,
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Verify user has access to workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          { 
            subscribers: {
              some: { userId: session.user.id }
            }
          }
        ]
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }

    // Create the message
    const message = await db.chatMessage.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        workspaceId: workspaceId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
