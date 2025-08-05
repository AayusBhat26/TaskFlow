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
    const validationResult = completePomodoroSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { duration, workspaceId } = validationResult.data;

    // Record the completed pomodoro session and award points
    const pomodoroResult = await recordPomodoroCompletion(
      session.user.id,
      duration,
      workspaceId
    );

    return NextResponse.json({
      success: true,
      session: pomodoroResult.session,
      pointsEarned: pomodoroResult.transaction.points,
      totalPoints: pomodoroResult.user.points,
      message: `Congratulations! You earned ${pomodoroResult.transaction.points} points for completing a ${duration}-minute pomodoro session!`,
      leveledUp: pomodoroResult.leveledUp,
      unlockedAchievements: pomodoroResult.unlockedAchievements,
    });
  } catch (error) {
    console.error('Error completing pomodoro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
