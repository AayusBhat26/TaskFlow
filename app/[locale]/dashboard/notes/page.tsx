import { Suspense } from 'react';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { NotesApp } from '@/components/notes/NotesApp';
import { OpenSidebar } from '@/components/header/OpenSidebar';

async function getUserNotes(userId: string) {
  try {
    const notes = await db.note.findMany({
      where: {
        authorId: userId,
        isArchived: false,
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

    return notes;
  } catch (error) {
    console.error('Error fetching user notes:', error);
    return [];
  }
}

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
      select: {
        id: true,
        name: true,
        color: true,
        image: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return workspaces;
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    return [];
  }
}

function NotesLoading() {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className="w-80 border-r border-border bg-muted/50 p-4">
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 p-8">
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default async function NotesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const [notes, workspaces] = await Promise.all([
    getUserNotes(session.user.id),
    getUserWorkspaces(session.user.id)
  ]);

  const currentUser = {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image,
    username: session.user.username || '',
  };

  // Transform notes to ensure author.name is never null
  const transformedNotes = notes.map(note => ({
    ...note,
    author: {
      ...note.author,
      name: note.author.name || 'Unknown User'
    }
  }));

  return (
    <div className="h-full flex flex-col">
      {/* Mobile sidebar toggle button */}
      <div className="absolute top-4 left-4 z-50 lg:hidden">
        <OpenSidebar />
      </div>
      
      <Suspense fallback={<NotesLoading />}>
        <NotesApp 
          notes={transformedNotes}
          workspaces={workspaces}
          currentUser={currentUser}
        />
      </Suspense>
    </div>
  );
}
