export const POINT_VALUES = {
  POMODORO: {
    25: 10,      // 25 minutes: 10 points
    30: 20,      // 30 minutes and below 40: 20 points
    40: 20,      // up to 40 minutes: 20 points
    60: 45,      // 60 minutes: 45 points
  },
  TASK_COMPLETION: 5,
  DSA_QUESTION: {
    EASY: 30,
    MEDIUM: 50,
    HARD: 80,
  },
} as const;

/**
 * Calculate points for a completed pomodoro session
 * @param durationMinutes - Duration of the pomodoro session in minutes
 * @returns Points earned for the session
 */
export function calculatePomodoroPoints(durationMinutes: number): number {
  if (durationMinutes <= 25) {
    return POINT_VALUES.POMODORO[25];
  } else if (durationMinutes <= 40) {
    return POINT_VALUES.POMODORO[30];
  } else if (durationMinutes <= 60) {
    return POINT_VALUES.POMODORO[60];
  } else {
    // For sessions longer than 60 minutes, give 45 points (same as 60 minutes)
    return POINT_VALUES.POMODORO[60];
  }
}

/**
 * Calculate points for a completed task
 * @returns Points earned for task completion
 */
export function calculateTaskCompletionPoints(): number {
  return POINT_VALUES.TASK_COMPLETION;
}

/**
 * Calculate points for a completed DSA question
 * @param difficulty - Difficulty level of the question (EASY, MEDIUM, HARD)
 * @returns Points earned for the question completion
 */
export function calculateDSAQuestionPoints(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): number {
  return POINT_VALUES.DSA_QUESTION[difficulty];
}

/**
 * Award points to a user and create a transaction record
 * @param userId - User ID to award points to
 * @param points - Number of points to award
 * @param type - Type of point transaction
 * @param description - Description of what earned the points
 * @param relatedId - Optional related entity ID (task ID, session ID, etc.)
 */
export async function awardPoints(
  userId: string,
  points: number,
  type: 'POMODORO_COMPLETED' | 'TASK_COMPLETED' | 'DSA_QUESTION_COMPLETED' | 'MANUAL_ADJUSTMENT',
  description: string,
  relatedId?: string
) {
  const { db } = await import('@/lib/db');
  
  try {
    // Use a transaction to ensure consistency
    const result = await db.$transaction(async (tx) => {
      // Create point transaction record
      const transaction = await tx.pointTransaction.create({
        data: {
          userId,
          points,
          type,
          description,
          relatedId,
        },
      });

      // Update user's total points
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points,
          },
        },
        select: {
          id: true,
          points: true,
          username: true,
        },
      });

      return { transaction, user };
    });

    console.log(`✅ Awarded ${points} points to user ${result.user.username} (Total: ${result.user.points})`);
    return result;
  } catch (error) {
    console.error('❌ Error awarding points:', error);
    throw error;
  }
}

/**
 * Record a completed pomodoro session and award points
 * @param userId - User ID
 * @param duration - Session duration in minutes
 * @param workspaceId - Optional workspace context
 */
export async function recordPomodoroCompletion(
  userId: string,
  duration: number,
  workspaceId?: string
) {
  const { db } = await import('@/lib/db');
  
  const basePoints = 25;
  const bonusPoints = Math.floor(duration / 60) * 2; // 2 points per minute
  const totalPoints = basePoints + bonusPoints;
  const experienceEarned = 20;
  
  try {
    // Import gaming service dynamically
    const { GamingService } = await import('@/services/gamingService');
    const { PointType, StreakType } = await import('@prisma/client');

    const result = await db.$transaction(async (tx) => {
      // Create pomodoro session record
      const session = await tx.pomodoroSession.create({
        data: {
          userId,
          duration,
          workspaceId,
          pointsEarned: totalPoints,
        },
      });

      // Update user Pomodoro completion count
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          totalPomodoroCompleted: { increment: 1 },
          lastActivityDate: new Date()
        }
      });

      // Award points using gaming service
      await GamingService.awardPoints(
        userId,
        totalPoints,
        PointType.POMODORO_COMPLETED,
        `Completed ${duration}-minute pomodoro session`
      );

      // Award experience
      const leveledUp = await GamingService.awardExperience(
        userId,
        experienceEarned,
        `Experience for completing ${duration}-minute pomodoro session`
      );

      // Update streaks
      await GamingService.updateStreak(userId, StreakType.POMODORO_SESSION);
      await GamingService.updateStreak(userId, StreakType.DAILY_LOGIN);

      // Check for achievement unlocks
      const unlockedAchievements = await GamingService.checkAchievements(userId);

      // Check special achievements for pomodoro completion
      const now = new Date();
      GamingService.checkSpecialAchievements(userId, {
        action: 'POMODORO_COMPLETED',
        timestamp: now
      }).catch(err => {
        console.error('Error checking special achievements for pomodoro:', err);
      });

      // Update leaderboards
      const { LeaderboardType } = await import('@prisma/client');
      await GamingService.updateLeaderboard(userId, LeaderboardType.TOTAL_POINTS, totalPoints);
      await GamingService.updateLeaderboard(userId, LeaderboardType.POMODORO_SESSIONS, 1);

      return {
        session,
        user,
        transaction: { points: totalPoints },
        leveledUp,
        unlockedAchievements
      };
    });

    return result;
  } catch (error) {
    console.error('❌ Error recording pomodoro completion:', error);
    throw error;
  }
}

/**
 * Record a completed task and award points
 * @param userId - User ID
 * @param taskId - Task ID
 * @param taskTitle - Task title for description
 */
export async function recordTaskCompletion(
  userId: string,
  taskId: string,
  taskTitle: string
) {
  const pointsEarned = 20; // Updated to match gaming system
  const experienceEarned = 15;
  
  try {
    // Import gaming service and types dynamically
    const { GamingService } = await import('@/services/gamingService');
    const { PointType, StreakType, LeaderboardType } = await import('@prisma/client');
    const { db } = await import('@/lib/db');

    // Use a transaction with longer timeout for gaming operations
    const result = await db.$transaction(async (tx) => {
      // Update user task completion count
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          totalTasksCompleted: { increment: 1 },
          lastActivityDate: new Date()
        }
      });

      return { user };
    }, {
      timeout: 10000, // 10 second timeout
    });

    // Handle gaming logic separately to avoid transaction timeout
    const [pointsAwarded, leveledUp, unlockedAchievements] = await Promise.all([
      GamingService.awardPoints(
        userId,
        pointsEarned,
        PointType.TASK_COMPLETED,
        `Completed task: ${taskTitle}`
      ).catch(err => {
        console.error('Error awarding points:', err);
        return null;
      }),
      
      GamingService.awardExperience(
        userId,
        experienceEarned,
        `Experience for completing task: ${taskTitle}`
      ).catch(err => {
        console.error('Error awarding experience:', err);
        return false;
      }),
      
      GamingService.checkAchievements(userId).catch(err => {
        console.error('Error checking achievements:', err);
        return [];
      })
    ]);

    // Check special achievements based on completion time
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday = 0, Saturday = 6
    
    Promise.all([
      GamingService.checkSpecialAchievements(userId, {
        action: 'TASK_COMPLETED',
        timestamp: now,
        isWeekend
      }).catch(err => {
        console.error('Error checking special achievements:', err);
      }),
      
      // Handle streaks and leaderboards in the background
      GamingService.updateStreak(userId, StreakType.TASK_COMPLETION),
      GamingService.updateStreak(userId, StreakType.DAILY_LOGIN),
      GamingService.updateLeaderboard(userId, LeaderboardType.TOTAL_POINTS, pointsEarned),
      GamingService.updateLeaderboard(userId, LeaderboardType.TASK_COMPLETION, 1)
    ]).catch(err => {
      console.error('Error updating streaks/leaderboards:', err);
    });

    return {
      user: result.user,
      transaction: { points: pointsEarned },
      leveledUp: leveledUp || false,
      unlockedAchievements: unlockedAchievements || []
    };
  } catch (error) {
    console.error('❌ Error recording task completion:', error);
    throw error;
  }
}

/**
 * Record a completed DSA question and award points
 * @param userId - User ID
 * @param questionId - Question ID
 * @param questionTitle - Question title for description
 * @param difficulty - Question difficulty level
 */
export async function recordDSAQuestionCompletion(
  userId: string,
  questionId: string,
  questionTitle: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
) {
  const pointsEarned = calculateDSAQuestionPoints(difficulty);
  
  try {
    // Award points for DSA completion
    const result = await awardPoints(
      userId,
      pointsEarned,
      'DSA_QUESTION_COMPLETED',
      `Completed ${difficulty.toLowerCase()} DSA question: ${questionTitle}`,
      questionId
    );

    // Check for achievement unlocks after DSA completion
    try {
      const { GamingService } = await import('@/services/gamingService');
      const unlockedAchievements = await GamingService.checkAchievements(userId);
      
      if (unlockedAchievements.length > 0) {
        console.log(`🏆 DSA completion unlocked ${unlockedAchievements.length} achievements for user ${userId}`);
      }
    } catch (error) {
      console.error('Error checking achievements after DSA completion:', error);
      // Don't fail the main function if achievement checking fails
    }

    return result;
  } catch (error) {
    console.error('❌ Error recording DSA question completion:', error);
    throw error;
  }
}
