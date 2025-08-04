import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    // Fix the specific task achievements with correct requirements
    const updates = [
      { name: "Task Warrior", requirement: 10, description: "Complete 10 tasks" },
      { name: "Task Master", requirement: 100, description: "Complete 100 tasks" },
      { name: "Task Legend", requirement: 1000, description: "Complete 1000 tasks" }
    ];

    const updatedAchievements = [];

    for (const update of updates) {
      const achievement = await db.achievement.findFirst({
        where: { name: update.name }
      });

      if (achievement) {
        const updated = await db.achievement.update({
          where: { id: achievement.id },
          data: {
            requirement: update.requirement,
            description: update.description
          }
        });
        updatedAchievements.push({
          name: updated.name,
          oldRequirement: achievement.requirement,
          newRequirement: updated.requirement,
          description: updated.description
        });
      }
    }

    // Get all task achievements to verify
    const taskAchievements = await db.achievement.findMany({
      where: {
        name: {
          in: ["Task Warrior", "Task Master", "Task Legend"]
        }
      },
      orderBy: { requirement: 'asc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Task achievement requirements fixed',
      updates: updatedAchievements,
      currentValues: taskAchievements.map(a => ({
        name: a.name,
        requirement: a.requirement,
        description: a.description
      }))
    });

  } catch (error) {
    console.error('Error fixing achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
