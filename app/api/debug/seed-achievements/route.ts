import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultAchievements } from "@/data/defaultGameData";

export async function POST() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Seed achievements using the correct default data
    const createdAchievements = [];
    const updatedAchievements = [];
    
    for (const achievement of defaultAchievements) {
      const existing = await db.achievement.findFirst({
        where: { name: achievement.name }
      });

      if (existing) {
        // Update existing achievement with correct values
        const updated = await db.achievement.update({
          where: { id: existing.id },
          data: {
            requirement: achievement.requirement,
            description: achievement.description,
            pointsReward: achievement.pointsReward,
            rarity: achievement.rarity
          }
        });
        updatedAchievements.push(updated);
      } else {
        // Create new achievement
        const created = await db.achievement.create({
          data: achievement
        });
        createdAchievements.push(created);
      }
    }

    // Create game settings if they don't exist
    const existingSettings = await db.gameSettings.findFirst();
    if (!existingSettings) {
      await db.gameSettings.create({
        data: {
          experiencePerLevel: 1000,
          experienceMultiplier: 1.5,
          maxLevel: 100,
          streakBonusThreshold: 7,
          streakBonusMultiplier: 1.5,
          dailyPointsLimit: 1000
        }
      });
    }

    // Get all achievements
    const allAchievements = await db.achievement.findMany({
      orderBy: { requirement: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Achievements seeded/updated successfully',
      createdCount: createdAchievements.length,
      updatedCount: updatedAchievements.length,
      totalCount: allAchievements.length,
      taskAchievements: allAchievements
        .filter(a => a.name.includes('Task'))
        .map(a => ({
          name: a.name,
          requirement: a.requirement,
          description: a.description
        }))
    });

  } catch (error) {
    console.error('Error seeding achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
