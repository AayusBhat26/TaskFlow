import { db } from '../lib/db';

async function testDSAPointsIntegration() {
  console.log('=== DSA Points Integration Test ===');
  
  // Get the first user
  const user = await db.user.findFirst();
  if (!user) {
    console.log('❌ No user found in database');
    return;
  }
  
  console.log(`Testing with user: ${user.username} (ID: ${user.id})`);
  console.log(`Current user points: ${user.points}`);
  
  // Get a sample DSA question of each difficulty
  const easyQuestion = await db.dSAQuestion.findFirst({
    where: { difficulty: 'EASY', isImported: false }
  });
  
  const mediumQuestion = await db.dSAQuestion.findFirst({
    where: { difficulty: 'MEDIUM', isImported: false }
  });
  
  const hardQuestion = await db.dSAQuestion.findFirst({
    where: { difficulty: 'HARD', isImported: false }
  });
  
  console.log('\nSample questions found:');
  if (easyQuestion) console.log(`- Easy: "${easyQuestion.title}"`);
  if (mediumQuestion) console.log(`- Medium: "${mediumQuestion.title}"`);
  if (hardQuestion) console.log(`- Hard: "${hardQuestion.title}"`);
  
  // Check existing point transactions for DSA questions
  const existingDSATransactions = await db.pointTransaction.findMany({
    where: {
      userId: user.id,
      type: 'DSA_QUESTION_COMPLETED'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  
  console.log(`\nExisting DSA point transactions: ${existingDSATransactions.length}`);
  existingDSATransactions.forEach(transaction => {
    console.log(`- ${transaction.points} points: ${transaction.description} (${transaction.createdAt.toLocaleDateString()})`);
  });
  
  // Check current progress records
  const currentProgress = await db.dSAProgress.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED'
    },
    include: {
      question: {
        select: {
          title: true,
          difficulty: true
        }
      }
    }
  });
  
  console.log(`\nCompleted questions: ${currentProgress.length}`);
  currentProgress.forEach(progress => {
    console.log(`- ${progress.question.difficulty}: "${progress.question.title}"`);
  });
  
  // Show expected vs actual points for completed questions
  if (currentProgress.length > 0) {
    console.log('\nPoints analysis for completed questions:');
    let expectedTotal = 0;
    currentProgress.forEach(progress => {
      const difficulty = progress.question.difficulty;
      let expectedPoints = 0;
      switch (difficulty) {
        case 'EASY': expectedPoints = 30; break;
        case 'MEDIUM': expectedPoints = 50; break;
        case 'HARD': expectedPoints = 80; break;
      }
      expectedTotal += expectedPoints;
      console.log(`- ${difficulty} question should award ${expectedPoints} points`);
    });
    
    const actualDSAPoints = existingDSATransactions.reduce((sum, t) => sum + t.points, 0);
    console.log(`\nExpected total DSA points: ${expectedTotal}`);
    console.log(`Actual DSA points in transactions: ${actualDSAPoints}`);
    
    if (expectedTotal === actualDSAPoints) {
      console.log('✅ Points are correctly awarded!');
    } else {
      console.log('⚠️ Points mismatch detected');
    }
  }
  
  console.log('\n=== Point Values Summary ===');
  console.log('DSA Questions:');
  console.log('- Easy: 30 points');
  console.log('- Medium: 50 points');
  console.log('- Hard: 80 points');
  console.log('\nOther activities (unchanged):');
  console.log('- Task completion: 5 points');
  console.log('- Pomodoro sessions: 10-45 points');
}

testDSAPointsIntegration().catch(console.error).finally(() => process.exit(0));
