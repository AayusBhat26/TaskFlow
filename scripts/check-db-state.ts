import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('=== Database State Check ===');
    
    // Check all main tables
    const counts = {
      users: await prisma.user.count(),
      workspaces: await prisma.workspace.count(),
      tasks: await prisma.task.count(),
      mindMaps: await prisma.mindMap.count(),
      dsaQuestions: await prisma.dSAQuestion.count(),
      dsaProgress: await prisma.dSAProgress.count(),
      pomodoroSessions: await prisma.pomodoroSession.count(),
      pointTransactions: await prisma.pointTransaction.count(),
      notifications: await prisma.notification.count(),
      chatMessages: await prisma.chatMessage.count(),
      notes: await prisma.note.count()
    };
    
    console.log('Table counts:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`${table}: ${count}`);
    });
    
    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    console.log(`\nTotal records in database: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('✅ Database is completely empty and reset successfully!');
    } else {
      console.log('⚠️ Database still contains some data');
    }
    
  } catch (error) {
    console.error('Error checking database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState().catch(console.error);
