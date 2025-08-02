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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Workspaces Found</h1>
          <p className="text-gray-600 mb-4">You need to be part of a workspace to use chat.</p>
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
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image,
    username: session.user.username || '',
  };

  return (
    <div className="h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }>
        <WorkspaceChat 
          workspaces={workspaces} 
          currentUser={currentUser}
        />
      </Suspense>
    </div>
  );
}
