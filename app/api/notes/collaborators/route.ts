import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const addCollaboratorSchema = z.object({
  noteId: z.string(),
  userId: z.string(),
  permission: z.enum(['read', 'write', 'admin'])
});

const updateCollaboratorSchema = z.object({
  permission: z.enum(['read', 'write', 'admin'])
});

// GET /api/notes/collaborators - Get note collaborators
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    // Verify user has access to the note
    const note = await db.note.findFirst({
      where: {
        id: noteId,
        OR: [
          { authorId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    const collaborators = await db.noteCollaborator.findMany({
      where: { noteId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        addedAt: 'asc'
      }
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching note collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}

// POST /api/notes/collaborators - Add collaborator
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = addCollaboratorSchema.parse(body);

    // Verify user is note owner or admin collaborator
    const note = await db.note.findFirst({
      where: {
        id: data.noteId,
        OR: [
          { authorId: session.user.id },
          {
            collaborators: {
              some: {
                userId: session.user.id,
                role: 'ADMIN'
              }
            }
          }
        ]
      }
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if user is already a collaborator
    const existingCollaborator = await db.noteCollaborator.findFirst({
      where: {
        noteId: data.noteId,
        userId: data.userId
      }
    });

    if (existingCollaborator) {
      return NextResponse.json(
        { error: 'User is already a collaborator' },
        { status: 409 }
      );
    }

    // Verify the user exists
    const user = await db.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Map permission to role
    const permissionToRole: Record<string, 'VIEWER' | 'EDITOR' | 'ADMIN'> = {
      read: 'VIEWER',
      write: 'EDITOR',
      admin: 'ADMIN'
    };

    const collaborator = await db.noteCollaborator.create({
      data: {
        noteId: data.noteId,
        userId: data.userId,
        role: permissionToRole[data.permission]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true
          }
        }
      }
    });

    // TODO: Send notification to user about being added as collaborator

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to add collaborator' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/collaborators - Update collaborator permission
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json({ error: 'Collaborator ID required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateCollaboratorSchema.parse(body);

    // Verify user has permission to update this collaborator
    const collaborator = await db.noteCollaborator.findFirst({
      where: {
        id: collaboratorId,
        note: {
          OR: [
            { authorId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: 'ADMIN'
                }
              }
            }
          ]
        }
      },
      include: {
        note: true
      }
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Map permission to role for update
    const permissionToRole: Record<string, 'VIEWER' | 'EDITOR' | 'ADMIN'> = {
      read: 'VIEWER',
      write: 'EDITOR',
      admin: 'ADMIN'
    };
    const updatedCollaborator = await db.noteCollaborator.update({
      where: { id: collaboratorId },
      data: { role: permissionToRole[data.permission] },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(updatedCollaborator);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to update collaborator' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/collaborators - Remove collaborator
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json({ error: 'Collaborator ID required' }, { status: 400 });
    }

    // Verify user has permission to remove this collaborator
    const collaborator = await db.noteCollaborator.findFirst({
      where: {
        id: collaboratorId,
        OR: [
          { userId: session.user.id }, 
          {
            note: {
              OR: [
                { authorId: session.user.id }, 
                {
                  collaborators: {
                    some: {
                      userId: session.user.id,
                      role: 'ADMIN'
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found or insufficient permissions' },
        { status: 403 }
      );
    }

    await db.noteCollaborator.delete({
      where: { id: collaboratorId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}
