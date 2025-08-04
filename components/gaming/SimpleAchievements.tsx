'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  pointsReward: number;
  rarity: string;
  userProgress: {
    progress: number;
    isCompleted: boolean;
    unlockedAt?: string;
  };
}

export default function SimpleAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/gaming/achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-500';
      case 'UNCOMMON': return 'bg-green-500';
      case 'RARE': return 'bg-blue-500';
      case 'EPIC': return 'bg-purple-500';
      case 'LEGENDARY': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.userProgress.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.userProgress.isCompleted && a.userProgress.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.userProgress.isCompleted && a.userProgress.progress === 0);

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your progress and unlock rewards!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Completed</p>
                <p className="text-3xl font-bold">{completedAchievements.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">In Progress</p>
                <p className="text-3xl font-bold">{inProgressAchievements.length}</p>
              </div>
              <Star className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Locked</p>
                <p className="text-3xl font-bold">{lockedAchievements.length}</p>
              </div>
              <Crown className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Completed Achievements ({completedAchievements.length})
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
                      {achievement.userProgress.unlockedAt && new Date(achievement.userProgress.unlockedAt).toLocaleDateString()}
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
              <Star className="h-5 w-5 text-blue-500" />
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
                      value={(achievement.userProgress.progress / 100) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {achievement.userProgress.progress} / 100
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-400" />
            Available Achievements ({lockedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <div key={achievement.id} className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <Badge variant="outline" className="text-xs">
                    {achievement.rarity}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-700">{achievement.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Not started</span>
                  <Badge variant="secondary" className="text-xs">
                    +{achievement.pointsReward}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
