import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/chat/messages?workspaceId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify user has access to this workspace
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: workspaceId,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Access denied to this workspace' }, { status: 403 });
    }

    // Fetch messages for the workspace
    const messages = await db.chatMessage.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/chat/messages
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { content, workspaceId } = body;

    if (!content || !workspaceId) {
      console.log('Missing content or workspaceId');
      return NextResponse.json({ error: 'Content and workspace ID are required' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    // Verify user has access to this workspace
    console.log('Checking subscription for user:', session.user.id, 'workspace:', workspaceId);
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: workspaceId,
      },
    });
    console.log('Subscription found:', subscription);

    if (!subscription) {
      return NextResponse.json({ error: 'Access denied to this workspace' }, { status: 403 });
    }

    // Create the message
    console.log('Creating message...');
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
          },
        },
      },
    });
    console.log('Message created:', message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
