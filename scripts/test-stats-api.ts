import { NextRequest } from 'next/server';
import { getAuthSession } from '../lib/auth';
import { db } from '../lib/db';

async function testStatsAPI() {
  console.log('=== Testing DSA Stats API ===');
  
  // Get the first user from database to test with
  const user = await db.user.findFirst();
  if (!user) {
    console.log('No user found in database');
    return;
  }
  
  console.log(`Testing with user: ${user.username} (${user.id})`);
  
  const userId = user.id;

  // Simulate the same queries that the API does
  const [
    totalQuestions,
    userProgress,
    topicProgress,
    recentActivity
  ] = await Promise.all([
    // Total curated questions available
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
    
    // Recent activity - curated questions only
    db.dSAProgress.findMany({
      where: {
        userId: userId,
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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

  console.log(`Total curated questions: ${totalQuestions}`);
  console.log(`User progress records: ${userProgress.length}`);
  console.log(`Topic progress records: ${topicProgress.length}`);
  console.log(`Recent activity records: ${recentActivity.length}`);
  
  // Process topic progress the same way as the API
  const topicStats: Record<string, { solved: number; total: number; inProgress: number }> = {};
  
  // Get all topics with their question counts
  const allTopics = await db.dSAQuestion.groupBy({
    by: ['topic'],
    where: {
      isImported: false
    },
    _count: {
      topic: true
    }
  });

  console.log('\nAll curated topics:');
  allTopics.forEach(topic => {
    console.log(`  ${topic.topic}: ${topic._count.topic} questions`);
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

  console.log('\nTopic stats result:');
  Object.entries(topicStats).forEach(([topic, stats]) => {
    console.log(`  ${topic}: ${stats.solved}/${stats.total} solved, ${stats.inProgress} in progress`);
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

  console.log('\nOverall stats:');
  console.log(`  Total: ${overallStats.total}`);
  console.log(`  Solved: ${overallStats.solved}`);
  console.log(`  In Progress: ${overallStats.inProgress}`);
  console.log(`  Todo: ${overallStats.todo}`);
}

testStatsAPI().catch(console.error).finally(() => process.exit(0));
