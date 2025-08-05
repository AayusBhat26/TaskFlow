import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createNoteLinkSchema = z.object({
  sourceNoteId: z.string(),
  targetNoteId: z.string(),
  context: z.string().optional()
});

// GET /api/notes/links - Get note links
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

    // Get both incoming and outgoing links
    const [outgoingLinks, incomingLinks] = await Promise.all([
      db.noteLink.findMany({
        where: { sourceNoteId: noteId },
        include: {
          targetNote: {
            select: {
              id: true,
              title: true,
              icon: true,
              updatedAt: true
            }
          }
        }
      }),
      db.noteLink.findMany({
        where: { targetNoteId: noteId },
        include: {
          sourceNote: {
            select: {
              id: true,
              title: true,
              icon: true,
              updatedAt: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      outgoing: outgoingLinks,
      incoming: incomingLinks
    });
  } catch (error) {
    console.error('Error fetching note links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note links' },
      { status: 500 }
    );
  }
}

// POST /api/notes/links - Create note link
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createNoteLinkSchema.parse(body);

    // Verify user has access to both notes
    const [sourceNote, targetNote] = await Promise.all([
      db.note.findFirst({
        where: {
          id: data.sourceNoteId,
          OR: [
            { authorId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: { in: ['EDITOR', 'ADMIN'] }
                }
              }
            }
          ]
        }
      }),
      db.note.findFirst({
        where: {
          id: data.targetNoteId,
          OR: [
            { authorId: session.user.id },
            { isPublic: true },
            {
              collaborators: {
                some: {
                  userId: session.user.id
                }
              }
            }
          ]
        }
      })
    ]);

    if (!sourceNote || !targetNote) {
      return NextResponse.json(
        { error: 'Access denied to one or both notes' },
        { status: 403 }
      );
    }

    // Check if link already exists
    const existingLink = await db.noteLink.findFirst({
      where: {
        sourceNoteId: data.sourceNoteId,
        targetNoteId: data.targetNoteId
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Link already exists' },
        { status: 409 }
      );
    }

    const noteLink = await db.noteLink.create({
      data: {
        sourceNoteId: data.sourceNoteId,
        targetNoteId: data.targetNoteId,
        context: data.context,
        createdById: session.user.id
      },
      include: {
        sourceNote: {
          select: {
            id: true,
            title: true,
            icon: true
          }
        },
        targetNote: {
          select: {
            id: true,
            title: true,
            icon: true
          }
        }
      }
    });

    return NextResponse.json(noteLink, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating note link:', error);
    return NextResponse.json(
      { error: 'Failed to create note link' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/links - Delete note link
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    const noteLink = await db.noteLink.findFirst({
      where: {
        id: linkId,
        OR: [
          { createdById: session.user.id },
          {
            sourceNote: {
              OR: [
                { authorId: session.user.id },
                {
                  collaborators: {
                    some: {
                      userId: session.user.id,
                      role: { in: ['EDITOR', 'ADMIN'] }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    });

    if (!noteLink) {
      return NextResponse.json(
        { error: 'Note link not found or access denied' },
        { status: 404 }
      );
    }

    await db.noteLink.delete({
      where: { id: linkId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note link:', error);
    return NextResponse.json(
      { error: 'Failed to delete note link' },
      { status: 500 }
    );
  }
}
