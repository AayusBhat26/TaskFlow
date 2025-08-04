'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Users, 
  Crown,
  Flame,
  Medal,
  Zap,
  Gift
} from 'lucide-react';

interface UserStats {
  id: string;
  username: string;
  level: number;
  experience: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalPomodoroCompleted: number;
  profileBadges: string[];
  currentTitle?: string;
  progressToNextLevel: number;
  nextLevelXp: number;
  currentLevelXp: number;
  userAchievements: any[];
  userStreaks: any[];
  leaderboardEntries: any[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  iconName: string;
  iconColor: string;
  requirement: number;
  pointsReward: number;
  rarity: string;
  isSecret: boolean;
  userProgress: {
    progress: number;
    isCompleted: boolean;
    unlockedAt?: string;
  };
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  requirement: number;
  pointsReward: number;
  experienceReward: number;
  timeLimit?: number;
  userProgress: {
    progress: number;
    isCompleted: boolean;
    startedAt?: string;
    completedAt?: string;
  };
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  user: {
    id: string;
    username: string;
    name: string;
    image?: string;
    level: number;
    profileBadges: string[];
    currentTitle?: string;
  };
}

export default function GamingDashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch('/api/gaming/stats');
      const statsData = await statsResponse.json();
      setUserStats(statsData);

      // Fetch achievements
      const achievementsResponse = await fetch('/api/gaming/achievements');
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData);

      // Fetch challenges
      const challengesResponse = await fetch('/api/gaming/challenges');
      const challengesData = await challengesResponse.json();
      setChallenges(challengesData);

      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/gaming/leaderboard?limit=10');
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData);

    } catch (error) {
      console.error('Error fetching gaming data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/gaming/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId })
      });

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-muted';
      case 'UNCOMMON': return 'bg-primary/20';
      case 'RARE': return 'bg-primary/40';
      case 'EPIC': return 'bg-primary/60';
      case 'LEGENDARY': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-primary/20';
      case 'MEDIUM': return 'bg-primary/40';
      case 'HARD': return 'bg-primary/60';
      case 'EXTREME': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading gaming dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Unable to load gaming data.</p>
          </div>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.userProgress.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.userProgress.isCompleted && a.userProgress.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.userProgress.isCompleted && a.userProgress.progress === 0 && !a.isSecret);

  const activeChallenges = challenges.filter(c => !c.userProgress.isCompleted && c.userProgress.progress > 0);
  const availableChallenges = challenges.filter(c => c.userProgress.progress === 0);
  const completedChallenges = challenges.filter(c => c.userProgress.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Gaming Dashboard</h1>
          <p className="text-muted-foreground">Track your progress, unlock achievements, and compete with others!</p>
        </div>

        {/* User Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm">Level</p>
                  <p className="text-3xl font-bold">{userStats.level}</p>
                </div>
                <Crown className="h-8 w-8 text-primary-foreground/80" />
              </div>
              <div className="mt-4">
                <Progress value={userStats.progressToNextLevel} className="bg-primary/20" />
                <p className="text-xs text-primary-foreground/80 mt-1">
                  {userStats.experience - userStats.currentLevelXp} / {userStats.nextLevelXp - userStats.currentLevelXp} XP
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-foreground/80 text-sm">Points</p>
                  <p className="text-3xl font-bold">{userStats.points.toLocaleString()}</p>
                </div>
                <Star className="h-8 w-8 text-secondary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-foreground/80 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold">{userStats.currentStreak}</p>
                </div>
                <Flame className="h-8 w-8 text-accent-foreground/80" />
              </div>
              <p className="text-xs text-accent-foreground/80 mt-2">Best: {userStats.longestStreak} days</p>
            </CardContent>
          </Card>

          <Card className="bg-muted text-muted-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground/80 text-sm">Achievements</p>
                  <p className="text-3xl font-bold">{completedAchievements.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground/80" />
              </div>
              <p className="text-xs text-muted-foreground/80 mt-2">of {achievements.length} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                    <span className="font-semibold">{userStats.totalTasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pomodoro Sessions</span>
                    <span className="font-semibold">{userStats.totalPomodoroCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Streak</span>
                    <span className="font-semibold">{userStats.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Experience Points</span>
                    <span className="font-semibold">{userStats.experience.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedAchievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <div className={`w-2 h-2 rounded-full ${getRarityColor(achievement.rarity)}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.pointsReward}
                        </Badge>
                      </div>
                    ))}
                    {completedAchievements.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No achievements unlocked yet. Start completing tasks to earn your first achievement!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {/* Achievement Categories */}
            <div className="space-y-6">
              {/* Completed Achievements */}
              {completedAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Completed ({completedAchievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedAchievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getRarityColor(achievement.rarity)}`} />
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Unlocked {achievement.userProgress.unlockedAt && new Date(achievement.userProgress.unlockedAt).toLocaleDateString()}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.pointsReward}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* In Progress Achievements */}
              {inProgressAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      In Progress ({inProgressAchievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {inProgressAchievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getRarityColor(achievement.rarity)}`} />
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          <div className="space-y-2">
                            <Progress 
                              value={(achievement.userProgress.progress / achievement.requirement) * 100} 
                              className="h-2"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                {achievement.userProgress.progress} / {achievement.requirement}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.pointsReward}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-gray-400" />
                      Locked ({lockedAchievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lockedAchievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 rounded-lg border bg-gray-50 border-gray-200 opacity-75">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400" />
                            <Badge variant="outline" className="text-xs">
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-gray-700">{achievement.name}</h4>
                          <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              0 / {achievement.requirement}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.pointsReward}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent-foreground" />
                    Active Challenges ({activeChallenges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeChallenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="space-y-2">
                          <Progress 
                            value={(challenge.userProgress.progress / challenge.requirement) * 100} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              {challenge.userProgress.progress} / {challenge.requirement}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                +{challenge.pointsReward} pts
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                +{challenge.experienceReward} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Challenges */}
            {availableChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Available Challenges ({availableChallenges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableChallenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              +{challenge.pointsReward} pts
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              +{challenge.experienceReward} XP
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startChallenge(challenge.id)}
                            className="bg-primary hover:bg-primary/80"
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Completed Challenges ({completedChallenges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedChallenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900">{challenge.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Completed {challenge.userProgress.completedAt && new Date(challenge.userProgress.completedAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              +{challenge.pointsReward} pts
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              +{challenge.experienceReward} XP
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>
                  See how you rank against other players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        entry.user.id === userStats.id 
                          ? 'bg-muted border-border' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {entry.user.name || entry.user.username}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            Level {entry.user.level}
                          </Badge>
                          {entry.user.currentTitle && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.user.currentTitle}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {entry.score.toLocaleString()} points
                        </p>
                      </div>
                      {entry.user.profileBadges.length > 0 && (
                        <div className="flex gap-1">
                          {entry.user.profileBadges.slice(0, 3).map((badge, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Medal className="h-3 w-3 text-primary-foreground" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No leaderboard data available yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
