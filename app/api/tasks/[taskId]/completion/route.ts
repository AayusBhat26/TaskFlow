import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = params;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const { isCompleted } = await req.json();

    // First, let's just find the task by ID to see if it exists
    const task = await db.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this task
    const hasAccess = task.creatorId === session.user.id ||
      await db.assignedToTask.findFirst({
        where: {
          taskId: taskId,
          userId: session.user.id
        }
      }) ||
      await db.subscription.findFirst({
        where: {
          workspaceId: task.workspaceId,
          userId: session.user.id
        }
      });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Since the Task model doesn't have an isCompleted field,
    // we'll need to handle this differently. For now, we'll add a completion record
    // or update the task's updatedAt field to track completion
    
    // Option 1: Add a completion record (requires new model)
    // Option 2: Use content field to store completion status
    // Option 3: Update schema to add isCompleted field

    // For now, let's use the content field to store completion status
    const currentContent = task.content as any || {};
    const updatedContent = {
      ...currentContent,
      isCompleted: Boolean(isCompleted),
      completedAt: isCompleted ? new Date().toISOString() : null,
      completedBy: isCompleted ? session.user.id : null
    };

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        content: updatedContent,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        assignedToTask: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: isCompleted ? 'Task marked as completed' : 'Task marked as pending'
    });

  } catch (error) {
    console.error('Error updating task completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get task completion status
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = params;

    const task = await db.task.findFirst({
      where: {
        id: taskId,
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
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        assignedToTask: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
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

    const content = task.content as any || {};
    // Use the database isCompleted field, not content
    const isCompleted = Boolean(task.isCompleted);
    const completedAt = task.completedAt || content.completedAt;
    const completedBy = content.completedBy;

    return NextResponse.json({
      success: true,
      task,
      isCompleted,
      completedAt,
      completedBy
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
