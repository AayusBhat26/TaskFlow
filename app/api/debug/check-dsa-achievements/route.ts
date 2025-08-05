import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { GamingService } from "@/services/gamingService";

export async function POST() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's DSA progress
    const dsaProgress = await db.dSAProgress.findMany({
      where: { 
        userId: session.user.id,
        status: 'COMPLETED'
      },
      include: { question: true }
    });

    const completedCount = dsaProgress.length;

    // Get DSA achievements
    const dsaAchievements = await db.achievement.findMany({
      where: {
        OR: [
          { name: { contains: 'Code' } },
          { name: { contains: 'Algorithm' } },
          { name: { contains: 'Data Structure' } }
        ]
      }
    });

    // Get current user achievement progress for DSA
    const userDSAAchievements = await db.userAchievement.findMany({
      where: {
        userId: session.user.id,
        achievementId: { in: dsaAchievements.map(a => a.id) }
      },
      include: { achievement: true }
    });

    // Manually check achievements
    const unlockedAchievements = await GamingService.checkAchievements(session.user.id);

    // Get updated progress
    const updatedUserDSAAchievements = await db.userAchievement.findMany({
      where: {
        userId: session.user.id,
        achievementId: { in: dsaAchievements.map(a => a.id) }
      },
      include: { achievement: true }
    });

    return NextResponse.json({
      success: true,
      dsaData: {
        completedQuestions: completedCount,
        completedList: dsaProgress.map(p => ({
          questionTitle: p.question.title,
          difficulty: p.question.difficulty,
          completedAt: p.completedAt
        }))
      },
      dsaAchievements: dsaAchievements.map(a => ({
        name: a.name,
        requirement: a.requirement,
        description: a.description
      })),
      beforeUpdate: userDSAAchievements.map(ua => ({
        achievementName: ua.achievement.name,
        progress: ua.progress,
        requirement: ua.achievement.requirement,
        isCompleted: ua.isCompleted
      })),
      afterUpdate: updatedUserDSAAchievements.map(ua => ({
        achievementName: ua.achievement.name,
        progress: ua.progress,
        requirement: ua.achievement.requirement,
        isCompleted: ua.isCompleted,
        progressPercentage: Math.round((ua.progress / ua.achievement.requirement) * 100)
      })),
      newlyUnlocked: unlockedAchievements
    });

  } catch (error) {
    console.error('Error checking DSA achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
