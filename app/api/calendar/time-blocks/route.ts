import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTimeBlockSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  type: z.enum(['DEEP_WORK', 'MEETING', 'BREAK', 'EMAIL', 'PLANNING', 'LEARNING', 'PERSONAL']),
  taskId: z.string().optional(),
  eventId: z.string().optional(),
  isLocked: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  tags: z.array(z.string()).optional(),
  estimatedProductivity: z.number().min(1).max(10).optional(),
  notes: z.string().optional()
});

const updateTimeBlockSchema = createTimeBlockSchema.partial().extend({
  actualProductivity: z.number().min(1).max(10).optional()
});

// GET /api/calendar/time-blocks - Get time blocks
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let where: any = {
      userId: session.user.id
    };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate && endDate) {
      where.AND = [
        {
          OR: [
            {
              startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              endTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              AND: [
                { startTime: { lte: new Date(startDate) } },
                { endTime: { gte: new Date(endDate) } }
              ]
            }
          ]
        }
      ];
    }

    if (type) {
      where.type = type;
    }

    const timeBlocks = await db.timeBlock.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(timeBlocks);
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/time-blocks - Create time block
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createTimeBlockSchema.parse(body);

    // Validate dates
    if (data.startTime >= data.endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for conflicts if not locked
    if (!data.isLocked) {
      const conflicts = await db.timeBlock.findMany({
        where: {
          userId: session.user.id,
          isLocked: true,
          OR: [
            {
              AND: [
                { startTime: { lte: data.startTime } },
                { endTime: { gt: data.startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: data.endTime } },
                { endTime: { gte: data.endTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: data.startTime } },
                { endTime: { lte: data.endTime } }
              ]
            }
          ]
        }
      });

      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: 'Time slot conflicts with locked time blocks' },
          { status: 409 }
        );
      }
    }

    const timeBlock = await db.timeBlock.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        taskId: data.taskId,
        eventId: data.eventId,
        isLocked: data.isLocked || false,
        priority: data.priority,
        tags: data.tags || [],
        estimatedProductivity: data.estimatedProductivity || 5,
        notes: data.notes,
        userId: session.user.id,
        color: getTimeBlockTypeColor(data.type)
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
        event: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(timeBlock, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating time block:', error);
    return NextResponse.json(
      { error: 'Failed to create time block' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/time-blocks/[id] - Update time block
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const timeBlockId = url.pathname.split('/').pop();

    if (!timeBlockId) {
      return NextResponse.json({ error: 'Time block ID required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateTimeBlockSchema.parse(body);

    // Verify user owns this time block
    const existingTimeBlock = await db.timeBlock.findFirst({
      where: {
        id: timeBlockId,
        userId: session.user.id
      }
    });

    if (!existingTimeBlock) {
      return NextResponse.json(
        { error: 'Time block not found or access denied' },
        { status: 404 }
      );
    }

    // Validate dates if being updated
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const updatedTimeBlock = await db.timeBlock.update({
      where: { id: timeBlockId },
      data: {
        ...data,
        ...(data.type && { color: getTimeBlockTypeColor(data.type) })
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
        event: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(updatedTimeBlock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating time block:', error);
    return NextResponse.json(
      { error: 'Failed to update time block' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/time-blocks/[id] - Delete time block
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const timeBlockId = url.pathname.split('/').pop();

    if (!timeBlockId) {
      return NextResponse.json({ error: 'Time block ID required' }, { status: 400 });
    }

    // Verify user owns this time block
    const timeBlock = await db.timeBlock.findFirst({
      where: {
        id: timeBlockId,
        userId: session.user.id
      }
    });

    if (!timeBlock) {
      return NextResponse.json(
        { error: 'Time block not found or access denied' },
        { status: 404 }
      );
    }

    await db.timeBlock.delete({
      where: { id: timeBlockId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time block:', error);
    return NextResponse.json(
      { error: 'Failed to delete time block' },
      { status: 500 }
    );
  }
}

// Helper function to get color for time block type
function getTimeBlockTypeColor(type: string): string {
  const colors = {
    DEEP_WORK: '#3B82F6',
    MEETING: '#10B981',
    BREAK: '#6B7280',
    EMAIL: '#F59E0B',
    PLANNING: '#8B5CF6',
    LEARNING: '#EC4899',
    PERSONAL: '#EF4444'
  };
  return colors[type as keyof typeof colors] || '#3B82F6';
}
