const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test if we can connect to the database
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test if Note model exists
    console.log('Checking if note model exists...');
    const noteCount = await prisma.note.count();
    console.log('Note count:', noteCount);
    
    // Check available models
    console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));
    
  } catch (error) {
    console.error('Database test error:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
