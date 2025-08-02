import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type'); // Optional filter by type

    const skip = (page - 1) * limit;

    // Get user's current points
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        username: true,
        points: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build filter condition
    const whereCondition: any = {
      userId: session.user.id,
    };

    if (type && ['POMODORO_COMPLETED', 'TASK_COMPLETED', 'MANUAL_ADJUSTMENT'].includes(type)) {
      whereCondition.type = type;
    }

    // Get paginated transaction history
    const [transactions, totalCount] = await Promise.all([
      db.pointTransaction.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.pointTransaction.count({
        where: whereCondition,
      }),
    ]);

    // Get point statistics
    const stats = await db.pointTransaction.groupBy({
      by: ['type'],
      where: {
        userId: session.user.id,
      },
      _sum: {
        points: true,
      },
      _count: true,
    });

    const pointStats = stats.reduce((acc, stat) => {
      acc[stat.type] = {
        totalPoints: stat._sum.points || 0,
        count: stat._count,
      };
      return acc;
    }, {} as Record<string, { totalPoints: number; count: number }>);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        totalPoints: user.points,
      },
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      stats: pointStats,
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
