import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

let connections = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const workspaceId = params.workspaceId;

  // Check if user has access to the workspace
  const subscription = await db.subscription.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: workspaceId,
      },
    },
  });

  if (!subscription) {
    return new Response('Access denied', { status: 403 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const connectionId = `${workspaceId}-${session.user.id}`;
      connections.set(connectionId, controller);
      
      console.log(`SSE connection established for workspace ${workspaceId}, user ${session.user.id}`);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        console.log(`SSE connection closed for workspace ${workspaceId}, user ${session.user.id}`);
        connections.delete(connectionId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to broadcast messages
function broadcastMessage(workspaceId: string, message: any) {
  console.log(`Broadcasting message to workspace ${workspaceId}:`, message.content);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(`data: ${JSON.stringify({ 
    type: 'new-message', 
    message: {
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      editedAt: message.editedAt ? message.editedAt.toISOString() : null
    }
  })}\n\n`);
  
  let broadcastCount = 0;
  for (const [connectionId, controller] of connections.entries()) {
    if (connectionId.startsWith(workspaceId)) {
      try {
        controller.enqueue(data);
        broadcastCount++;
      } catch (error) {
        console.error(`Failed to broadcast to connection ${connectionId}:`, error);
        // Connection closed, remove it
        connections.delete(connectionId);
      }
    }
  }
  
  console.log(`Message broadcasted to ${broadcastCount} connections`);
}
