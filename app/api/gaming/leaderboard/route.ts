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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'TOTAL_POINTS';
    const period = searchParams.get('period') || 'ALL_TIME';
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboard = await db.leaderboardEntry.findMany({
      where: {
        leaderboardType: type as any,
        period: period as any
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            level: true,
            profileBadges: true,
            currentTitle: true
          }
        }
      },
      orderBy: { rank: 'asc' },
      take: limit
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
