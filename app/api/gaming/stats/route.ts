import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamingService } from '@/services/gamingService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userStats = await GamingService.getUserStats(session.user.id);
    
    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'award_points': {
        const { points, type, description } = data;
        await GamingService.awardPoints(session.user.id, points, type, description);
        return NextResponse.json({ success: true });
      }

      case 'award_experience': {
        const { experience, description } = data;
        const leveledUp = await GamingService.awardExperience(session.user.id, experience, description);
        return NextResponse.json({ success: true, leveledUp });
      }

      case 'update_streak': {
        const { streakType } = data;
        const updated = await GamingService.updateStreak(session.user.id, streakType);
        return NextResponse.json({ success: true, updated });
      }

      case 'check_achievements': {
        const unlockedAchievements = await GamingService.checkAchievements(session.user.id);
        return NextResponse.json({ success: true, unlockedAchievements });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing gaming action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
