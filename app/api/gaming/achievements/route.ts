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

    const achievements = await db.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId: session.user.id },
          select: {
            id: true,
            progress: true,
            isCompleted: true,
            unlockedAt: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { requirement: 'asc' }
      ]
    });

    const achievementsWithProgress = achievements.map(achievement => ({
      ...achievement,
      userProgress: achievement.userAchievements[0] || {
        progress: 0,
        isCompleted: false,
        unlockedAt: null
      }
    }));

    return NextResponse.json(achievementsWithProgress);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
