'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Award, TrendingUp, Star, Medal } from 'lucide-react';

interface AchievementStats {
  totalAchievements: number;
  completedAchievements: number;
  inProgressAchievements: number;
  recentAchievements: number;
  completionPercentage: number;
  totalPointsFromAchievements: number;
  categoryStats: Record<string, number>;
  rarityStats: Record<string, number>;
}

interface AchievementStatsWidgetProps {
  stats?: AchievementStats;
}

const defaultStats: AchievementStats = {
  totalAchievements: 0,
  completedAchievements: 0,
  inProgressAchievements: 0,
  recentAchievements: 0,
  completionPercentage: 0,
  totalPointsFromAchievements: 0,
  categoryStats: {},
  rarityStats: {}
};

const AchievementStatsWidget: React.FC<AchievementStatsWidgetProps> = ({ stats = defaultStats }) => {
  const [achievementStats, setAchievementStats] = useState<AchievementStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievementStats = async () => {
      try {
        const response = await fetch('/api/gaming/achievements/stats');
        if (response.ok) {
          const data = await response.json();
          setAchievementStats(data);
        }
      } catch (error) {
        console.error('Error fetching achievement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementStats();
  }, []);

  const displayStats = stats !== defaultStats ? stats : achievementStats;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Unlocked</span>
                </div>
                <div className="text-2xl font-bold text-primary">{displayStats.completedAchievements}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Completion</span>
                </div>
                <div className="text-2xl font-bold text-accent-foreground">{displayStats.completionPercentage}%</div>
              </div>
            </div>

            {displayStats.totalAchievements === 0 ? (
              <div className="text-center py-4">
                <div className="text-muted-foreground text-sm">
                  No achievements available yet. Complete tasks, solve problems, and use pomodoro sessions to unlock achievements!
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Recent (7 days)</div>
                    <div className="text-xl font-semibold text-primary">{displayStats.recentAchievements}</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">In Progress</div>
                    <div className="text-xl font-semibold text-accent-foreground">{displayStats.inProgressAchievements}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <div className="text-lg font-semibold text-muted-foreground">{displayStats.totalAchievements}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Points Earned</span>
                    </div>
                    <div className="text-lg font-semibold text-primary">{displayStats.totalPointsFromAchievements}</div>
                  </div>
                </div>

                {Object.keys(displayStats.categoryStats).length > 0 && (
                  <div className="border-t border-border pt-3 mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Top Categories</div>
                    <div className="space-y-1">
                      {Object.entries(displayStats.categoryStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([category, count]) => (
                          <div key={category} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{category.toLowerCase().replace('_', ' ')}</span>
                            <span className="font-medium text-foreground">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementStatsWidget;
