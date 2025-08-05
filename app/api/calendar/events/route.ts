import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  allDay: z.boolean().optional(),
  type: z.enum(['MEETING', 'DEADLINE', 'REMINDER', 'PERSONAL', 'WORK', 'BREAK', 'FOCUS_TIME']),
  location: z.string().optional(),
  taskId: z.string().optional(),
  attendeeEmails: z.array(z.string().email()).optional(),
  recurringRule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number().min(1),
    endDate: z.string().transform(str => new Date(str)).optional()
  }).optional(),
  // Reminders functionality not yet implemented
  // reminders: z.array(z.object({
  //   type: z.enum(['EMAIL', 'NOTIFICATION', 'SMS']),
  //   minutesBefore: z.number().min(0)
  // })).optional()
});

const updateEventSchema = createEventSchema.partial();

// GET /api/calendar/events - Get calendar events
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const workspaceId = searchParams.get('workspaceId');

    let where: any = {
      OR: [
        { creatorId: session.user.id },
        {
          attendees: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    };

    if (startDate && endDate) {
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

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const events = await db.calendarEvent.findMany({
      where,
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events - Create calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createEventSchema.parse(body);

    // Validate dates
    if (data.startTime >= data.endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Create event with transaction for attendees and reminders
    const event = await db.$transaction(async (tx) => {
      const newEvent = await tx.calendarEvent.create({
        data: {
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          allDay: data.allDay || false,
          type: data.type,
          location: data.location,
          taskId: data.taskId,
          creatorId: session.user.id,
          recurringRule: data.recurringRule,
          color: getEventTypeColor(data.type)
        }
      });

      // Add attendees
      if (data.attendeeEmails && data.attendeeEmails.length > 0) {
        for (const email of data.attendeeEmails) {
          const user = await tx.user.findUnique({
            where: { email }
          });

          if (user) {
            await tx.calendarAttendee.create({
              data: {
                eventId: newEvent.id,
                userId: user.id,
                status: user.id === session.user.id ? 'ACCEPTED' : 'PENDING'
              }
            });
          }
        }
      }

      // Add reminders
      // TODO: Implement reminders functionality - EventReminder model not yet created
      /*
      if (data.reminders && data.reminders.length > 0) {
        for (const reminder of data.reminders) {
          await tx.eventReminder.create({
            data: {
              eventId: newEvent.id,
              type: reminder.type,
              minutesBefore: reminder.minutesBefore
            }
          });
        }
      }
      */

      return newEvent;
    });

    // Fetch the created event with relations
    const fullEvent = await db.calendarEvent.findUnique({
      where: { id: event.id },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(fullEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// Helper function to get color for event type
function getEventTypeColor(type: string): string {
  const colors = {
    MEETING: '#3B82F6',
    DEADLINE: '#EF4444',
    REMINDER: '#F59E0B',
    PERSONAL: '#10B981',
    WORK: '#8B5CF6',
    BREAK: '#6B7280',
    FOCUS_TIME: '#EC4899'
  };
  return colors[type as keyof typeof colors] || '#3B82F6';
}
