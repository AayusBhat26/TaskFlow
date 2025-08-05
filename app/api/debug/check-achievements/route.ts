import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GamingService } from "@/services/gamingService";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data for debugging
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        userAchievements: {
          include: { achievement: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get additional stats for debugging
    const [dsaCount, messageCount, workspaceCount] = await Promise.all([
      db.dSAProgress.count({
        where: { userId: session.user.id, status: 'COMPLETED' }
      }),
      db.chatMessage.count({
        where: { authorId: session.user.id }
      }),
      db.subscription.count({
        where: { userId: session.user.id }
      })
    ]);

    // Get all achievements from database
    const allAchievements = await db.achievement.findMany({
      orderBy: [{ category: 'asc' }, { requirement: 'asc' }]
    });

    // Check for new achievement unlocks
    const unlockedAchievements = await GamingService.checkAchievements(session.user.id);

    // Get updated user achievements
    const updatedUserAchievements = await db.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { achievement: { category: 'asc' } }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        level: user.level,
        experience: user.experience,
        totalTasksCompleted: user.totalTasksCompleted,
        totalPomodoroCompleted: user.totalPomodoroCompleted,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        dsaCompletedCount: dsaCount,
        messageCount: messageCount,
        workspaceCount: workspaceCount
      },
      allAchievements: allAchievements.map(a => ({
        id: a.id,
        name: a.name,
        requirement: a.requirement,
        category: a.category,
        description: a.description
      })),
      userAchievements: updatedUserAchievements.map(ua => ({
        id: ua.id,
        achievementName: ua.achievement.name,
        category: ua.achievement.category,
        isCompleted: ua.isCompleted,
        progress: ua.progress,
        requirement: ua.achievement.requirement,
        unlockedAt: ua.unlockedAt,
        progressPercentage: Math.round((ua.progress / ua.achievement.requirement) * 100)
      })),
      newlyUnlocked: unlockedAchievements,
      summary: {
        totalAchievements: allAchievements.length,
        unlockedCount: updatedUserAchievements.filter(ua => ua.isCompleted).length,
        inProgressCount: updatedUserAchievements.filter(ua => !ua.isCompleted && ua.progress > 0).length
      }
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
