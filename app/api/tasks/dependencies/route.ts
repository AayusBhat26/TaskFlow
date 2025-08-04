import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createDependencySchema = z.object({
  taskId: z.string(),
  dependsOnTaskId: z.string(),
  type: z.enum(['BLOCKING', 'RELATED', 'SUBTASK'])
});

// GET /api/tasks/dependencies - Get task dependencies
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const workspaceId = searchParams.get('workspaceId');

    let where: any = {};

    if (taskId) {
      where = {
        OR: [
          { taskId },
          { dependsOnTaskId: taskId }
        ]
      };
    } else if (workspaceId) {
      where = {
        task: {
          workspaceId
        }
      };
    }

    const dependencies = await db.taskDependency.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
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

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error('Error fetching task dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/dependencies - Create task dependency
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createDependencySchema.parse(body);

    // Verify user has access to both tasks
    const [task, dependsOnTask] = await Promise.all([
      db.task.findFirst({
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
      }),
      db.task.findFirst({
        where: {
          id: data.dependsOnTaskId,
          workspace: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      })
    ]);

    if (!task || !dependsOnTask) {
      return NextResponse.json(
        { error: 'One or both tasks not found or access denied' },
        { status: 404 }
      );
    }

    // Check for circular dependencies
    const wouldCreateCycle = await checkForCircularDependency(
      data.dependsOnTaskId,
      data.taskId
    );

    if (wouldCreateCycle) {
      return NextResponse.json(
        { error: 'This dependency would create a circular reference' },
        { status: 400 }
      );
    }

    // Check if dependency already exists
    const existingDependency = await db.taskDependency.findFirst({
      where: {
        taskId: data.taskId,
        dependsOnTaskId: data.dependsOnTaskId
      }
    });

    if (existingDependency) {
      return NextResponse.json(
        { error: 'Dependency already exists' },
        { status: 409 }
      );
    }

    const dependency = await db.taskDependency.create({
      data: {
        taskId: data.taskId,
        dependsOnTaskId: data.dependsOnTaskId,
        type: data.type,
        createdById: session.user.id
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          }
        },
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true
          }
        }
      }
    });

    return NextResponse.json(dependency, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating task dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/dependencies - Remove task dependency
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dependencyId = searchParams.get('dependencyId');

    if (!dependencyId) {
      return NextResponse.json({ error: 'Dependency ID required' }, { status: 400 });
    }

    // Verify user has access to delete this dependency
    const dependency = await db.taskDependency.findFirst({
      where: {
        id: dependencyId,
        task: {
          workspace: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    });

    if (!dependency) {
      return NextResponse.json(
        { error: 'Dependency not found or access denied' },
        { status: 404 }
      );
    }

    await db.taskDependency.delete({
      where: { id: dependencyId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}

// Helper function to check for circular dependencies
async function checkForCircularDependency(
  startTaskId: string,
  targetTaskId: string,
  visited: Set<string> = new Set()
): Promise<boolean> {
  if (startTaskId === targetTaskId) {
    return true;
  }

  if (visited.has(startTaskId)) {
    return false;
  }

  visited.add(startTaskId);

  const dependencies = await db.taskDependency.findMany({
    where: { dependsOnTaskId: startTaskId },
    select: { taskId: true }
  });

  for (const dep of dependencies) {
    if (await checkForCircularDependency(dep.taskId, targetTaskId, visited)) {
      return true;
    }
  }

  return false;
}
