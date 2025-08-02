import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('=== Task Debug Route ===');
    
    const session = await getAuthSession();
    console.log('Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'No session found',
        debug: 'User needs to be logged in'
      }, { status: 401 });
    }

    // Check if user exists in database
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });
    console.log('User in DB:', {
      exists: !!user,
      id: user?.id,
      email: user?.email
    });

    // Check workspaces user has access to
    const workspaces = await db.workspace.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            subscribers: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        creatorId: true,
        _count: {
          select: {
            tasks: true,
            subscribers: true
          }
        }
      }
    });
    console.log('User workspaces:', workspaces);

    // Check all tasks user has access to
    const tasks = await db.task.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            assignedToTask: {
              some: {
                userId: session.user.id
              }
            }
          },
          {
            workspace: {
              subscribers: {
                some: {
                  userId: session.user.id
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        creatorId: true,
        workspaceId: true,
        content: true,
        workspace: {
          select: {
            name: true
          }
        }
      }
    });
    console.log('User tasks:', tasks);

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          email: session.user.email
        },
        userInDb: !!user,
        workspaces: workspaces,
        tasks: tasks,
        taskCount: tasks.length
      }
    });

  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Create a test task for debugging
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create a workspace for the user
    let workspace = await db.workspace.findFirst({
      where: {
        OR: [
          { creatorId: session.user.id },
          {
            subscribers: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!workspace) {
      // Create a test workspace
      workspace = await db.workspace.create({
        data: {
          name: 'Test Workspace',
          creatorId: session.user.id,
          adminCode: `admin-${Math.random().toString(36).substring(7)}`,
          canEditCode: `edit-${Math.random().toString(36).substring(7)}`,
          inviteCode: `invite-${Math.random().toString(36).substring(7)}`,
          readOnlyCode: `readonly-${Math.random().toString(36).substring(7)}`,
        }
      });

      // Add user as subscriber
      await db.subscription.create({
        data: {
          userId: session.user.id,
          workspaceId: workspace.id,
          userRole: 'ADMIN'
        }
      });
    }

    // Create a test task
    const testTask = await db.task.create({
      data: {
        title: 'Test Task for Debugging',
        emoji: '🧪',
        content: { text: 'This is a test task created for debugging the completion feature.' },
        workspaceId: workspace.id,
        creatorId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test task created',
      task: testTask,
      workspace: workspace
    });

  } catch (error) {
    console.error('Create test task error:', error);
    return NextResponse.json({
      error: 'Failed to create test task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
