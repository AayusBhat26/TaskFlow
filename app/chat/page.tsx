import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { WorkspaceChat } from '@/components/chat/WorkspaceChat';

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user's workspaces
  const userWithWorkspaces = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      subscriptions: {
        include: {
          workspace: {
            include: {
              _count: {
                select: {
                  subscribers: true,
                },
              },
              subscribers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      username: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithWorkspaces) {
    redirect('/auth/signin');
  }

  const workspaces = userWithWorkspaces.subscriptions.map((sub: any) => ({
    ...sub.workspace,
    subscribers: sub.workspace.subscribers.map((subscriber: any) => ({
      user: {
        id: subscriber.user.id,
        name: subscriber.user.name || subscriber.user.username || 'Unknown',
        username: subscriber.user.username || subscriber.user.name || 'unknown',
        image: subscriber.user.image,
      },
    })),
  }));
  
  const currentUser = {
    id: userWithWorkspaces.id,
    name: userWithWorkspaces.name || userWithWorkspaces.username || 'Unknown User',
    email: userWithWorkspaces.email || '',
    image: userWithWorkspaces.image,
    username: userWithWorkspaces.username || userWithWorkspaces.name || 'unknown',
  };

  return (
    <main className="h-screen bg-background">
      <WorkspaceChat 
        workspaces={workspaces}
        currentUser={currentUser}
      />
    </main>
  );
}
