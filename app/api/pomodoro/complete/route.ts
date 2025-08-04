import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { recordPomodoroCompletion } from "@/lib/points";
import { z } from "zod";

const completePomodoroSchema = z.object({
  duration: z.number().min(1).max(120), // Duration in minutes
  workspaceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = completePomodoroSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.errors },
        { status: 400 }
      );
    }

    const { duration, workspaceId } = result.data;

    // Record the completed pomodoro session and award points
    const result = await recordPomodoroCompletion(
      session.user.id,
      duration,
      workspaceId
    );

    return NextResponse.json({
      success: true,
      session: result.session,
      pointsEarned: result.transaction.points,
      totalPoints: result.user.points,
      message: `Congratulations! You earned ${result.transaction.points} points for completing a ${duration}-minute pomodoro session!`,
      leveledUp: result.leveledUp,
      unlockedAchievements: result.unlockedAchievements,
    });
  } catch (error) {
    console.error('Error completing pomodoro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
