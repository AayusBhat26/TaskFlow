import { 
  AchievementCategory, 
  AchievementType, 
  AchievementRarity 
} from '@prisma/client';

export const defaultAchievements = [
  // Productivity Achievements
  {
    name: "First Task",
    description: "Complete your first task",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.MILESTONE,
    iconName: "CheckCircle",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 10,
    badgeId: "first-task",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Task Warrior",
    description: "Complete 10 tasks",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.CUMULATIVE,
    iconName: "Trophy",
    iconColor: "#F59E0B",
    requirement: 10,
    pointsReward: 50,
    badgeId: "task-warrior",
    rarity: AchievementRarity.UNCOMMON
  },
  {
    name: "Task Master",
    description: "Complete 100 tasks",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.CUMULATIVE,
    iconName: "Crown",
    iconColor: "#8B5CF6",
    requirement: 100,
    pointsReward: 200,
    badgeId: "task-master",
    rarity: AchievementRarity.RARE
  },
  {
    name: "Task Legend",
    description: "Complete 1000 tasks",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.CUMULATIVE,
    iconName: "Star",
    iconColor: "#EF4444",
    requirement: 1000,
    pointsReward: 1000,
    badgeId: "task-legend",
    rarity: AchievementRarity.LEGENDARY
  },

  // Pomodoro Achievements
  {
    name: "Focus Beginner",
    description: "Complete your first Pomodoro session",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.MILESTONE,
    iconName: "Clock",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 15,
    badgeId: "focus-beginner",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Focus Expert",
    description: "Complete 25 Pomodoro sessions",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.CUMULATIVE,
    iconName: "Timer",
    iconColor: "#F59E0B",
    requirement: 25,
    pointsReward: 100,
    badgeId: "focus-expert",
    rarity: AchievementRarity.UNCOMMON
  },
  {
    name: "Focus Master",
    description: "Complete 100 Pomodoro sessions",
    category: AchievementCategory.PRODUCTIVITY,
    type: AchievementType.CUMULATIVE,
    iconName: "Zap",
    iconColor: "#8B5CF6",
    requirement: 100,
    pointsReward: 300,
    badgeId: "focus-master",
    rarity: AchievementRarity.RARE
  },

  // Consistency Achievements
  {
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    category: AchievementCategory.CONSISTENCY,
    type: AchievementType.STREAK,
    iconName: "Calendar",
    iconColor: "#10B981",
    requirement: 3,
    pointsReward: 25,
    badgeId: "getting-started",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Dedicated User",
    description: "Maintain a 7-day streak",
    category: AchievementCategory.CONSISTENCY,
    type: AchievementType.STREAK,
    iconName: "CalendarDays",
    iconColor: "#F59E0B",
    requirement: 7,
    pointsReward: 75,
    badgeId: "dedicated-user",
    rarity: AchievementRarity.UNCOMMON
  },
  {
    name: "Consistency Champion",
    description: "Maintain a 30-day streak",
    category: AchievementCategory.CONSISTENCY,
    type: AchievementType.STREAK,
    iconName: "Fire",
    iconColor: "#EF4444",
    requirement: 30,
    pointsReward: 250,
    badgeId: "consistency-champion",
    rarity: AchievementRarity.RARE
  },
  {
    name: "Unstoppable Force",
    description: "Maintain a 100-day streak",
    category: AchievementCategory.CONSISTENCY,
    type: AchievementType.STREAK,
    iconName: "Flame",
    iconColor: "#DC2626",
    requirement: 100,
    pointsReward: 1000,
    badgeId: "unstoppable-force",
    rarity: AchievementRarity.LEGENDARY
  },

  // DSA Mastery Achievements
  {
    name: "Code Explorer",
    description: "Solve your first DSA question",
    category: AchievementCategory.MASTERY,
    type: AchievementType.MILESTONE,
    iconName: "Code",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 20,
    badgeId: "code-explorer",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Algorithm Apprentice",
    description: "Solve 25 DSA questions",
    category: AchievementCategory.MASTERY,
    type: AchievementType.CUMULATIVE,
    iconName: "Brain",
    iconColor: "#F59E0B",
    requirement: 25,
    pointsReward: 150,
    badgeId: "algorithm-apprentice",
    rarity: AchievementRarity.UNCOMMON
  },
  {
    name: "Data Structure Guru",
    description: "Solve 100 DSA questions",
    category: AchievementCategory.MASTERY,
    type: AchievementType.CUMULATIVE,
    iconName: "Cpu",
    iconColor: "#8B5CF6",
    requirement: 100,
    pointsReward: 500,
    badgeId: "data-structure-guru",
    rarity: AchievementRarity.RARE
  },

  // Social/Collaboration Achievements
  {
    name: "Team Player",
    description: "Join your first workspace",
    category: AchievementCategory.COLLABORATION,
    type: AchievementType.MILESTONE,
    iconName: "Users",
    iconColor: "#10B981",
    requirement: 1,
    pointsReward: 30,
    badgeId: "team-player",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Social Butterfly",
    description: "Send 50 chat messages",
    category: AchievementCategory.SOCIAL,
    type: AchievementType.CUMULATIVE,
    iconName: "MessageCircle",
    iconColor: "#F59E0B",
    requirement: 50,
    pointsReward: 100,
    badgeId: "social-butterfly",
    rarity: AchievementRarity.UNCOMMON
  },

  // Special Achievements
  {
    name: "Early Bird",
    description: "Complete a task before 6 AM",
    category: AchievementCategory.SPECIAL,
    type: AchievementType.RARE_EVENT,
    iconName: "Sunrise",
    iconColor: "#F59E0B",
    requirement: 1,
    pointsReward: 50,
    badgeId: "early-bird",
    rarity: AchievementRarity.RARE,
    isSecret: true
  },
  {
    name: "Night Owl",
    description: "Complete a task after 10 PM",
    category: AchievementCategory.SPECIAL,
    type: AchievementType.RARE_EVENT,
    iconName: "Moon",
    iconColor: "#8B5CF6",
    requirement: 1,
    pointsReward: 50,
    badgeId: "night-owl",
    rarity: AchievementRarity.RARE,
    isSecret: true
  },
  {
    name: "Weekend Warrior",
    description: "Complete 10 tasks on weekends",
    category: AchievementCategory.SPECIAL,
    type: AchievementType.CUMULATIVE,
    iconName: "Calendar",
    iconColor: "#EF4444",
    requirement: 10,
    pointsReward: 150,
    badgeId: "weekend-warrior",
    rarity: AchievementRarity.RARE
  },

  // Level-based Achievements
  {
    name: "Level Up",
    description: "Reach level 5",
    category: AchievementCategory.MASTERY,
    type: AchievementType.MILESTONE,
    iconName: "TrendingUp",
    iconColor: "#10B981",
    requirement: 5,
    pointsReward: 100,
    badgeId: "level-up",
    rarity: AchievementRarity.COMMON
  },
  {
    name: "Rising Star",
    description: "Reach level 10",
    category: AchievementCategory.MASTERY,
    type: AchievementType.MILESTONE,
    iconName: "Star",
    iconColor: "#F59E0B",
    requirement: 10,
    pointsReward: 250,
    badgeId: "rising-star",
    rarity: AchievementRarity.UNCOMMON
  },
  {
    name: "Elite Player",
    description: "Reach level 25",
    category: AchievementCategory.MASTERY,
    type: AchievementType.MILESTONE,
    iconName: "Award",
    iconColor: "#8B5CF6",
    requirement: 25,
    pointsReward: 500,
    badgeId: "elite-player",
    rarity: AchievementRarity.RARE
  },
  {
    name: "Legendary Master",
    description: "Reach level 50",
    category: AchievementCategory.MASTERY,
    type: AchievementType.MILESTONE,
    iconName: "Crown",
    iconColor: "#EF4444",
    requirement: 50,
    pointsReward: 1500,
    badgeId: "legendary-master",
    rarity: AchievementRarity.LEGENDARY
  }
];

export const defaultChallenges = [
  // Daily Challenges
  {
    name: "Daily Grind",
    description: "Complete 3 tasks today",
    type: "DAILY" as const,
    category: "TASK_COMPLETION" as const,
    difficulty: "EASY" as const,
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
    type: "DAILY" as const,
    category: "POMODORO_FOCUS" as const,
    difficulty: "EASY" as const,
    requirement: 2,
    timeLimit: 24,
    pointsReward: 40,
    experienceReward: 20,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },

  // Weekly Challenges
  {
    name: "Productivity Beast",
    description: "Complete 25 tasks this week",
    type: "WEEKLY" as const,
    category: "TASK_COMPLETION" as const,
    difficulty: "MEDIUM" as const,
    requirement: 25,
    timeLimit: 168,
    pointsReward: 300,
    experienceReward: 150,
    badgeReward: "productivity-beast",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    name: "Deep Focus",
    description: "Complete 15 Pomodoro sessions this week",
    type: "WEEKLY" as const,
    category: "POMODORO_FOCUS" as const,
    difficulty: "MEDIUM" as const,
    requirement: 15,
    timeLimit: 168,
    pointsReward: 250,
    experienceReward: 125,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    name: "Code Warrior",
    description: "Solve 10 DSA questions this week",
    type: "WEEKLY" as const,
    category: "DSA_PRACTICE" as const,
    difficulty: "HARD" as const,
    requirement: 10,
    timeLimit: 168,
    pointsReward: 400,
    experienceReward: 200,
    badgeReward: "code-warrior",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },

  // Monthly Challenges
  {
    name: "Consistency Master",
    description: "Maintain a 20-day streak this month",
    type: "MONTHLY" as const,
    category: "CONSISTENCY" as const,
    difficulty: "HARD" as const,
    requirement: 20,
    timeLimit: 720,
    pointsReward: 1000,
    experienceReward: 500,
    badgeReward: "consistency-master",
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
];
