import { PrismaClient } from '@prisma/client';
import { defaultAchievements, defaultChallenges } from '../data/defaultGameData';

const prisma = new PrismaClient();

async function seedGameData() {
  try {
    console.log('🎮 Seeding gaming system data...');

    // Create default achievements
    console.log('📝 Creating achievements...');
    for (const achievement of defaultAchievements) {
      try {
        await prisma.achievement.create({
          data: achievement
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - achievement already exists
          console.log(`  ⚠️ Achievement "${achievement.name}" already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Processed ${defaultAchievements.length} achievements`);

    // Create default challenges
    console.log('🎯 Creating challenges...');
    for (const challenge of defaultChallenges) {
      try {
        await prisma.challenge.create({
          data: challenge
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - challenge already exists
          console.log(`  ⚠️ Challenge "${challenge.name}" already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Processed ${defaultChallenges.length} challenges`);

    // Create default game settings
    console.log('⚙️ Creating game settings...');
    const existingSettings = await prisma.gameSettings.findFirst();
    if (!existingSettings) {
      await prisma.gameSettings.create({
        data: {
          experiencePerLevel: 1000,
          experienceMultiplier: 1.5,
          maxLevel: 100,
          streakBonusThreshold: 7,
          streakBonusMultiplier: 1.5,
          dailyPointsLimit: 1000
        }
      });
      console.log('✅ Created game settings');
    } else {
      console.log('⚠️ Game settings already exist, skipping...');
    }

    console.log('🎉 Gaming system seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding gaming data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedGameData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedGameData;
