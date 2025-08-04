import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTimeEntrySchema = z.object({
  taskId: z.string(),
  description: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)).optional(),
  isRunning: z.boolean().optional()
});

const updateTimeEntrySchema = z.object({
  description: z.string().optional(),
  endTime: z.string().transform(str => new Date(str)).optional(),
  isRunning: z.boolean().optional()
});

// GET /api/tasks/time-tracking - Get time entries
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const isRunning = searchParams.get('isRunning');

    let where: any = {
      userId: userId || session.user.id
    };

    if (taskId) {
      where.taskId = taskId;
    }

    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) {
        where.startTime.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.startTime.lte = new Date(dateTo);
      }
    }

    if (isRunning !== null) {
      where.isRunning = isRunning === 'true';
    }

    const timeEntries = await db.taskTimeEntry.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            workspace: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Calculate total time for each entry
    const entriesWithDuration = timeEntries.map(entry => {
      const duration = entry.endTime 
        ? entry.endTime.getTime() - entry.startTime.getTime()
        : entry.isRunning 
          ? Date.now() - entry.startTime.getTime()
          : 0;
      
      return {
        ...entry,
        duration: Math.floor(duration / 1000) // seconds
      };
    });

    return NextResponse.json(entriesWithDuration);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/time-tracking - Create time entry (start timer)
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createTimeEntrySchema.parse(body);

    // Verify user has access to the task
    const task = await db.task.findFirst({
      where: {
        id: data.taskId,
        workspace: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Stop any currently running timers for this user
    await db.taskTimeEntry.updateMany({
      where: {
        userId: session.user.id,
        isRunning: true
      },
      data: {
        isRunning: false,
        endTime: new Date()
      }
    });

    const timeEntry = await db.taskTimeEntry.create({
      data: {
        taskId: data.taskId,
        userId: session.user.id,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        isRunning: data.isRunning ?? true
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/time-tracking - Update time entry (stop timer)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateTimeEntrySchema.parse(body);

    // Verify user owns this time entry
    const timeEntry = await db.taskTimeEntry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id
      }
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found or access denied' },
        { status: 404 }
      );
    }

    const updatedEntry = await db.taskTimeEntry.update({
      where: { id: entryId },
      data: {
        description: data.description,
        endTime: data.endTime || (data.isRunning === false ? new Date() : undefined),
        isRunning: data.isRunning
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Calculate duration
    const duration = updatedEntry.endTime 
      ? updatedEntry.endTime.getTime() - updatedEntry.startTime.getTime()
      : updatedEntry.isRunning 
        ? Date.now() - updatedEntry.startTime.getTime()
        : 0;

    return NextResponse.json({
      ...updatedEntry,
      duration: Math.floor(duration / 1000)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/time-tracking - Delete time entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    // Verify user owns this time entry
    const timeEntry = await db.taskTimeEntry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id
      }
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found or access denied' },
        { status: 404 }
      );
    }

    await db.taskTimeEntry.delete({
      where: { id: entryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
}
