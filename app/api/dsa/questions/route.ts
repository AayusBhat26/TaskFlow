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

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const includeImported = searchParams.get('includeImported') === 'true';

    // Build where clause for questions
    const whereClause: any = {};
    
    // By default, exclude imported questions to show only curated/original questions
    if (!includeImported) {
      whereClause.isImported = false;
    }
    
    if (topic && topic !== 'all') {
      whereClause.topic = topic;
    }
    
    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = difficulty.toUpperCase();
    }
    
    if (platform && platform !== 'all') {
      whereClause.platform = platform;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Get questions with user progress
    const questions = await db.dSAQuestion.findMany({
      where: whereClause,
      include: {
        progress: {
          where: { userId: session.user.id },
          select: {
            id: true,
            status: true,
            attempts: true,
            timeSpent: true,
            completedAt: true,
            rating: true,
            notes: true,
          }
        }
      },
      orderBy: [
        { frequency: 'desc' },
        { difficulty: 'asc' },
        { title: 'asc' }
      ]
    });

    // Filter by status if requested
    let filteredQuestions = questions;
    if (status && status !== 'all') {
      filteredQuestions = questions.filter(q => {
        if (status === 'TODO') {
          return q.progress.length === 0 || q.progress[0].status === 'TODO';
        }
        return q.progress.length > 0 && q.progress[0].status === status.toUpperCase();
      });
    }

    // Calculate statistics
    const totalQuestions = filteredQuestions.length;
    const completedQuestions = filteredQuestions.filter(q => 
      q.progress.length > 0 && q.progress[0].status === 'COMPLETED'
    ).length;
    const inProgressQuestions = filteredQuestions.filter(q => 
      q.progress.length > 0 && q.progress[0].status === 'IN_PROGRESS'
    ).length;

    // Get topic-wise progress
    const allTopics = await db.dSAQuestion.groupBy({
      by: ['topic'],
      _count: {
        topic: true
      },
      orderBy: {
        topic: 'asc'
      }
    });

    const topicProgress = await Promise.all(
      allTopics.map(async (topicData) => {
        const topicQuestions = await db.dSAQuestion.count({
          where: { topic: topicData.topic }
        });
        
        const completedInTopic = await db.dSAProgress.count({
          where: {
            userId: session.user.id,
            status: 'COMPLETED',
            question: {
              topic: topicData.topic
            }
          }
        });

        return {
          topic: topicData.topic,
          total: topicQuestions,
          completed: completedInTopic,
          percentage: topicQuestions > 0 ? Math.round((completedInTopic / topicQuestions) * 100) : 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      questions: filteredQuestions,
      stats: {
        total: totalQuestions,
        completed: completedQuestions,
        inProgress: inProgressQuestions,
        completionPercentage: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
      },
      topicProgress
    });

  } catch (error) {
    console.error('Error fetching DSA questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      topic,
      difficulty = 'MEDIUM',
      leetcodeUrl,
      platform = 'LeetCode',
      tags = [],
      hints = [],
      companies = [],
      frequency = 1,
      timeComplexity,
      spaceComplexity,
      approach
    } = body;

    if (!title || !topic) {
      return NextResponse.json(
        { error: 'Title and topic are required' },
        { status: 400 }
      );
    }

    const question = await db.dSAQuestion.create({
      data: {
        title,
        description,
        topic,
        difficulty,
        leetcodeUrl,
        platform,
        tags,
        hints,
        companies,
        frequency,
        timeComplexity,
        spaceComplexity,
        approach
      }
    });

    return NextResponse.json({
      success: true,
      question
    });

  } catch (error) {
    console.error('Error creating DSA question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
