import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const count = await prisma.user.count();
    console.log(`Found ${count} users in database`);
    
    // Try to create a simple achievement
    const achievement = await prisma.achievement.create({
      data: {
        name: 'Test Achievement',
        description: 'This is a test achievement',
        category: 'PRODUCTIVITY',
        type: 'MILESTONE',
        iconName: 'Star',
        iconColor: '#FFD700',
        requirement: 1,
        pointsReward: 10,
        rarity: 'COMMON'
      }
    });
    
    console.log('Created test achievement:', achievement);
    
    // Clean up
    await prisma.achievement.delete({
      where: { id: achievement.id }
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
