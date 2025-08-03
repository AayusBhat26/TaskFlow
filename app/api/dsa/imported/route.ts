import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    const batchId = searchParams.get('batchId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    // Build filter conditions for imported questions
    const where: any = {
      isImported: true
    };
    
    // Only show questions imported by this user or questions without an importedBy field (legacy imports)
    where.OR = [
      { importedBy: userId },
      { importedBy: null, isImported: true }
    ];
    
    if (batchId && batchId !== 'all') {
      where.importBatchId = batchId;
    }
    
    if (topic && topic !== 'all') {
      where.topic = topic;
    }
    
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty.toUpperCase();
    }
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Get imported questions with pagination
    const [questions, totalCount] = await Promise.all([
      db.dSAQuestion.findMany({
        where,
        include: {
          progress: {
            where: { userId }
          },
          _count: {
            select: {
              progress: true
            }
          }
        },
        orderBy: {
          importedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.dSAQuestion.count({ where })
    ]);
    
    // Get import batches for the user
    const importBatches = await db.dSAQuestion.groupBy({
      by: ['importBatchId', 'importBatchName', 'originalFileName', 'importedAt'],
      where: {
        isImported: true,
        OR: [
          { importedBy: userId },
          { importedBy: null, isImported: true }
        ],
        importBatchId: { not: null },
        originalFileName: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        importedAt: 'desc'
      }
    });
    
    // Get topic-wise statistics for imported questions
    const topicStats = await prisma.dSAQuestion.groupBy({
      by: ['topic'],
      where: {
        isImported: true,
        OR: [
          { importedBy: userId },
          { importedBy: null, isImported: true }
        ]
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    // Get difficulty-wise statistics
    const difficultyStats = await prisma.dSAQuestion.groupBy({
      by: ['difficulty'],
      where: {
        isImported: true,
        OR: [
          { importedBy: userId },
          { importedBy: null, isImported: true }
        ]
      },
      _count: {
        id: true
      }
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      questions: questions.map(q => ({
        ...q,
        userProgress: q.progress?.[0] || null,
        totalAttempts: q._count.progress
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      importBatches: importBatches.map(batch => ({
        batchId: batch.importBatchId,
        batchName: batch.importBatchName || batch.originalFileName,
        fileName: batch.originalFileName,
        importedAt: batch.importedAt,
        questionCount: batch._count.id
      })),
      statistics: {
        totalImported: totalCount,
        byTopic: topicStats.map(stat => ({
          topic: stat.topic,
          count: stat._count.id
        })),
        byDifficulty: difficultyStats.map(stat => ({
          difficulty: stat.difficulty,
          count: stat._count.id
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching imported DSA questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch imported questions' },
      { status: 500 }
    );
  }
}
