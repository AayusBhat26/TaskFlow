import { Suspense } from 'react';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { WorkspaceChat } from '@/components/chat/WorkspaceChat';

async function getUserWorkspaces(userId: string) {
  try {
    const workspaces = await db.workspace.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { 
            subscribers: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            subscribers: true
          }
        },
        subscribers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return workspaces;
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    return [];
  }
}

export default async function ChatPage() {
  const session = await getAuthSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const workspaces = await getUserWorkspaces(session.user.id);

  if (workspaces.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Workspaces Found</h1>
          <p className="text-muted-foreground mb-4">You need to be part of a workspace to use chat.</p>
          <a 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const currentUser = {
    id: session.user.id,
    name: session.user.name || session.user.username || 'Unknown User',
    email: session.user.email || '',
    image: session.user.image,
    username: session.user.username || session.user.name || 'unknown',
  };

  const transformedWorkspaces = workspaces.map((workspace: any) => ({
    ...workspace,
    subscribers: workspace.subscribers.map((sub: any) => ({
      user: {
        id: sub.user.id,
        name: sub.user.name || sub.user.username || 'Unknown',
        username: sub.user.username || sub.user.name || 'unknown',
        image: sub.user.image,
      },
    })),
  }));

  return (
    <div className="flex h-full max-h-screen overflow-hidden bg-background">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <WorkspaceChat 
          workspaces={transformedWorkspaces} 
          currentUser={currentUser}
        />
      </Suspense>
    </div>
  );
}
