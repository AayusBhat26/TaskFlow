import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total achievements count
    const totalAchievements = await db.achievement.count();

    // Get user's completed achievements
    const userCompletedAchievements = await db.userAchievement.count({
      where: {
        userId: session.user.id,
        isCompleted: true
      }
    });

    // Get user's achievements in progress
    const userInProgressAchievements = await db.userAchievement.count({
      where: {
        userId: session.user.id,
        isCompleted: false,
        progress: {
          gt: 0
        }
      }
    });

    // Get recently unlocked achievements (last 7 days)
    const recentAchievements = await db.userAchievement.count({
      where: {
        userId: session.user.id,
        isCompleted: true,
        unlockedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get achievements by category
    const achievementsByCategory = await db.userAchievement.groupBy({
      by: ['achievementId'],
      where: {
        userId: session.user.id,
        isCompleted: true
      },
      _count: true
    });

    // Get the actual achievement data for completed ones
    const completedAchievements = await db.userAchievement.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true
      },
      include: {
        achievement: {
          select: {
            category: true,
            rarity: true,
            pointsReward: true
          }
        }
      }
    });

    // Calculate stats by category
    const categoryStats: Record<string, number> = {};
    const rarityStats: Record<string, number> = {};
    let totalPointsFromAchievements = 0;

    completedAchievements.forEach(userAchievement => {
      const category = userAchievement.achievement.category;
      const rarity = userAchievement.achievement.rarity;
      
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      rarityStats[rarity] = (rarityStats[rarity] || 0) + 1;
      totalPointsFromAchievements += userAchievement.achievement.pointsReward || 0;
    });

    // Calculate completion percentage
    const completionPercentage = totalAchievements > 0 
      ? Math.round((userCompletedAchievements / totalAchievements) * 100)
      : 0;

    return NextResponse.json({
      totalAchievements,
      completedAchievements: userCompletedAchievements,
      inProgressAchievements: userInProgressAchievements,
      recentAchievements,
      completionPercentage,
      totalPointsFromAchievements,
      categoryStats,
      rarityStats
    });

  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
