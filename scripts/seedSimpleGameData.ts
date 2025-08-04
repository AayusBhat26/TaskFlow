import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const simpleAchievements = [
  {
    name: "First Task",
    description: "Complete your first task",
    category: "PRODUCTIVITY",
    type: "MILESTONE",
    iconName: "CheckCircle",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 10,
    badgeId: "first-task",
    rarity: "COMMON"
  },
  {
    name: "Task Warrior",
    description: "Complete 10 tasks",
    category: "PRODUCTIVITY",
    type: "CUMULATIVE",
    iconName: "Trophy",
    iconColor: "#F59E0B",
    requirement: 10,
    pointsReward: 50,
    badgeId: "task-warrior",
    rarity: "UNCOMMON"
  },
  {
    name: "Focus Beginner",
    description: "Complete your first Pomodoro session",
    category: "PRODUCTIVITY",
    type: "MILESTONE",
    iconName: "Clock",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 15,
    badgeId: "focus-beginner",
    rarity: "COMMON"
  },
  {
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    category: "CONSISTENCY",
    type: "STREAK",
    iconName: "Calendar",
    iconColor: "#10B981",
    requirement: 3,
    pointsReward: 25,
    badgeId: "getting-started",
    rarity: "COMMON"
  },
  {
    name: "Code Explorer",
    description: "Solve your first DSA question",
    category: "MASTERY",
    type: "MILESTONE",
    iconName: "Code",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 20,
    badgeId: "code-explorer",
    rarity: "COMMON"
  }
];

const simpleChallenges = [
  {
    name: "Daily Grind",
    description: "Complete 3 tasks today",
    type: "DAILY",
    category: "TASK_COMPLETION",
    difficulty: "EASY",
    requirement: 3,
    timeLimit: 24,
    pointsReward: 50,
    experienceReward: 25,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    name: "Focus Sprint",
    description: "Complete 2 Pomodoro sessions today",
    type: "DAILY",
    category: "POMODORO_FOCUS",
    difficulty: "EASY",
    requirement: 2,
    timeLimit: 24,
    pointsReward: 40,
    experienceReward: 20,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    name: "Productivity Beast",
    description: "Complete 25 tasks this week",
    type: "WEEKLY",
    category: "TASK_COMPLETION",
    difficulty: "MEDIUM",
    requirement: 25,
    timeLimit: 168,
    pointsReward: 300,
    experienceReward: 150,
    badgeReward: "productivity-beast",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
];

async function seedSimpleGameData() {
  try {
    console.log('🎮 Seeding simple gaming system data...');

    // Create achievements
    console.log('📝 Creating achievements...');
    for (const achievement of simpleAchievements) {
      try {
        const created = await prisma.achievement.create({
          data: achievement as any
        });
        console.log(`  ✅ Created: ${created.name}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️ Achievement "${achievement.name}" already exists, skipping...`);
        } else {
          console.error(`  ❌ Error creating "${achievement.name}":`, error.message);
        }
      }
    }

    // Create challenges
    console.log('🎯 Creating challenges...');
    for (const challenge of simpleChallenges) {
      try {
        const created = await prisma.challenge.create({
          data: challenge as any
        });
        console.log(`  ✅ Created: ${created.name}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`  ⚠️ Challenge "${challenge.name}" already exists, skipping...`);
        } else {
          console.error(`  ❌ Error creating "${challenge.name}":`, error.message);
        }
      }
    }

    // Create game settings
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
      console.log('  ✅ Created game settings');
    } else {
      console.log('  ⚠️ Game settings already exist, skipping...');
    }

    console.log('🎉 Gaming system seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding gaming data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSimpleGameData();
