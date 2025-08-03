import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get overall progress statistics - ONLY for curated questions (isImported: false)
    const [
      totalQuestions,
      userProgress,
      topicProgress,
      difficultyProgress,
      recentActivity
    ] = await Promise.all([
      // Total curated questions available (excluding imported ones)
      db.dSAQuestion.count({
        where: {
          isImported: false
        }
      }),
      
      // User's progress on curated questions only
      db.dSAProgress.groupBy({
        by: ['status'],
        where: {
          userId: userId,
          question: {
            isImported: false
          }
        },
        _count: {
          status: true
        }
      }),
      
      // Progress by topic - curated questions only
      db.dSAProgress.findMany({
        where: {
          userId: userId,
          question: {
            isImported: false
          }
        },
        include: {
          question: {
            select: {
              topic: true,
              difficulty: true
            }
          }
        }
      }),
      
      // Progress by difficulty - curated questions only
      db.dSAProgress.groupBy({
        by: ['status'],
        where: {
          userId: userId,
          question: {
            isImported: false
          }
        },
        _count: {
          status: true
        }
      }),
      
      // Recent activity (last 7 days) - curated questions only
      db.dSAProgress.findMany({
        where: {
          userId: userId,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          },
          question: {
            isImported: false
          }
        },
        include: {
          question: {
            select: {
              title: true,
              topic: true,
              difficulty: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      })
    ]);

    // Process topic progress
    const topicStats: Record<string, { solved: number; total: number; inProgress: number }> = {};
    
    // First, get all topics with their question counts
    const allTopics = await db.dSAQuestion.groupBy({
      by: ['topic'],
      where: {
        isImported: false
      },
      _count: {
        topic: true
      }
    });

    // Initialize topic stats
    allTopics.forEach(topic => {
      topicStats[topic.topic] = {
        total: topic._count.topic,
        solved: 0,
        inProgress: 0
      };
    });

    // Update with user progress
    topicProgress.forEach(progress => {
      const topic = progress.question.topic;
      if (topicStats[topic]) {
        if (progress.status === 'COMPLETED') {
          topicStats[topic].solved++;
        } else if (progress.status === 'IN_PROGRESS') {
          topicStats[topic].inProgress++;
        }
      }
    });

    // Process difficulty progress
    const difficultyStats: Record<string, { solved: number; total: number; inProgress: number }> = {
      EASY: { solved: 0, total: 0, inProgress: 0 },
      MEDIUM: { solved: 0, total: 0, inProgress: 0 },
      HARD: { solved: 0, total: 0, inProgress: 0 }
    };

    // Get total questions by difficulty
    const difficultyTotals = await db.dSAQuestion.groupBy({
      by: ['difficulty'],
      where: {
        isImported: false
      },
      _count: {
        difficulty: true
      }
    });

    difficultyTotals.forEach(diff => {
      difficultyStats[diff.difficulty].total = diff._count.difficulty;
    });

    // Update with user progress by difficulty
    const userDifficultyProgress = await db.dSAProgress.groupBy({
      by: ['status'],
      where: {
        userId: userId,
        question: {
          difficulty: {
            in: ['EASY', 'MEDIUM', 'HARD']
          },
          isImported: false
        }
      },
      _count: {
        status: true
      }
    });

    const userDifficultyDetailed = await db.dSAProgress.findMany({
      where: {
        userId: userId,
        question: {
          isImported: false
        }
      },
      include: {
        question: {
          select: {
            difficulty: true
          }
        }
      }
    });

    userDifficultyDetailed.forEach(progress => {
      const difficulty = progress.question.difficulty;
      if (progress.status === 'COMPLETED') {
        difficultyStats[difficulty].solved++;
      } else if (progress.status === 'IN_PROGRESS') {
        difficultyStats[difficulty].inProgress++;
      }
    });

    // Process overall stats
    const overallStats = {
      total: totalQuestions,
      solved: 0,
      inProgress: 0,
      todo: 0
    };

    userProgress.forEach(progress => {
      if (progress.status === 'COMPLETED') {
        overallStats.solved = progress._count.status;
      } else if (progress.status === 'IN_PROGRESS') {
        overallStats.inProgress = progress._count.status;
      } else if (progress.status === 'TODO') {
        overallStats.todo = progress._count.status;
      }
    });

    // Calculate completion percentage
    const completionPercentage = totalQuestions > 0 
      ? Math.round((overallStats.solved / totalQuestions) * 100) 
      : 0;

    // Get streak information
    const streak = await calculateStreak(userId);

    return NextResponse.json({
      overall: {
        ...overallStats,
        completionPercentage
      },
      topics: topicStats,
      difficulty: difficultyStats,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        questionTitle: activity.question.title,
        topic: activity.question.topic,
        difficulty: activity.question.difficulty,
        status: activity.status,
        updatedAt: activity.updatedAt
      })),
      streak
    });

  } catch (error) {
    console.error('Error fetching DSA statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all solved curated questions ordered by completion date
    const solvedQuestions = await db.dSAProgress.findMany({
      where: {
        userId: userId,
        status: 'COMPLETED',
        completedAt: {
          not: null
        },
        question: {
          isImported: false
        }
      },
      select: {
        completedAt: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    if (solvedQuestions.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if user solved anything today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const solvedToday = solvedQuestions.some(q => {
      if (!q.completedAt) return false;
      const completedDate = new Date(q.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    if (!solvedToday) {
      // Check if solved yesterday to continue streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const solvedYesterday = solvedQuestions.some(q => {
        if (!q.completedAt) return false;
        const completedDate = new Date(q.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === yesterday.getTime();
      });

      if (!solvedYesterday) {
        return 0;
      }
      
      currentDate = yesterday;
    }

    // Count consecutive days
    for (let i = 0; i < solvedQuestions.length; i++) {
      const completedDate = new Date(solvedQuestions[i].completedAt!);
      completedDate.setHours(0, 0, 0, 0);

      if (completedDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (completedDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}
