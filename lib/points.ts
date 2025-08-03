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
  
  const pointsEarned = calculatePomodoroPoints(duration);
  
  try {
    const result = await db.$transaction(async (tx) => {
      // Create pomodoro session record
      const session = await tx.pomodoroSession.create({
        data: {
          userId,
          duration,
          workspaceId,
          pointsEarned,
        },
      });

      // Award points
      const pointsResult = await awardPoints(
        userId,
        pointsEarned,
        'POMODORO_COMPLETED',
        `Completed ${duration}-minute pomodoro session`,
        session.id
      );

      return { session, ...pointsResult };
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
  const pointsEarned = calculateTaskCompletionPoints();
  
  try {
    const result = await awardPoints(
      userId,
      pointsEarned,
      'TASK_COMPLETED',
      `Completed task: ${taskTitle}`,
      taskId
    );

    return result;
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
    const result = await awardPoints(
      userId,
      pointsEarned,
      'DSA_QUESTION_COMPLETED',
      `Completed ${difficulty.toLowerCase()} DSA question: ${questionTitle}`,
      questionId
    );

    return result;
  } catch (error) {
    console.error('❌ Error recording DSA question completion:', error);
    throw error;
  }
}
