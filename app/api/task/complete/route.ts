import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { recordTaskCompletion } from "@/lib/points";
import { z } from "zod";

const completeTaskSchema = z.object({
  taskId: z.string(),
  workspaceId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = completeTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { taskId, workspaceId } = validationResult.data;

    // Check if user has access to the workspace
    const subscription = await db.subscription.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspaceId,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (subscription.userRole === "READ_ONLY") {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        workspaceId: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Task not in specified workspace' }, { status: 400 });
    }

    if (task.isCompleted) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
    }

    // Use transaction to update task only
    const updatedTask = await db.$transaction(async (tx) => {
      // Mark task as completed
      const task = await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          updatedUserId: session.user.id,
        },
      });

      return task;
    });

    // Handle points and gaming logic outside the main transaction
    let pointsResult;
    try {
      pointsResult = await recordTaskCompletion(
        session.user.id,
        taskId,
        task.title
      );
    } catch (error) {
      console.error('Error recording task completion points:', error);
      // Don't fail the whole request if points fail
      pointsResult = {
        transaction: { points: 20 },
        user: { points: 0 },
        leveledUp: false,
        unlockedAchievements: []
      };
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      pointsEarned: pointsResult.transaction.points,
      totalPoints: pointsResult.user.points,
      message: `Task completed! You earned ${pointsResult.transaction.points} points!`,
      leveledUp: pointsResult.leveledUp,
      unlockedAchievements: pointsResult.unlockedAchievements,
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
