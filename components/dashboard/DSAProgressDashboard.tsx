"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Star,
  ArrowRight,
  Flame
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DSAStats {
  overall: {
    total: number;
    solved: number;
    inProgress: number;
    todo: number;
    completionPercentage: number;
  };
  topics: Record<string, {
    solved: number;
    total: number;
    inProgress: number;
  }>;
  difficulty: Record<string, {
    solved: number;
    total: number;
    inProgress: number;
  }>;
  recentActivity: Array<{
    id: string;
    questionTitle: string;
    topic: string;
    difficulty: string;
    status: string;
    updatedAt: string;
  }>;
  streak: number;
}

export function DSAProgressDashboard() {
  const [stats, setStats] = useState<DSAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dsa/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching DSA stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-accent-foreground bg-muted border-border';
      case 'MEDIUM': return 'text-secondary-foreground bg-secondary border-border';
      case 'HARD': return 'text-destructive-foreground bg-destructive border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-primary-foreground bg-primary border-border';
      case 'IN_PROGRESS': return 'text-accent-foreground bg-accent border-border';
      case 'TODO': return 'text-muted-foreground bg-muted border-border';
      case 'REVIEW': return 'text-secondary-foreground bg-secondary border-border';
      case 'SKIPPED': return 'text-muted-foreground bg-muted border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Failed to load DSA progress</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topTopics = Object.entries(stats.topics)
    .sort((a, b) => b[1].solved - a[1].solved)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            DSA Practice Progress
          </h2>
          <p className="text-muted-foreground">
            Track your progress on curated Data Structures & Algorithms questions
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dsa')}
          className="flex items-center gap-2"
        >
          Practice DSA
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curated Questions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overall.solved}/{stats.overall.total}
            </div>
            <Progress 
              value={stats.overall.completionPercentage} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overall.completionPercentage}% completed
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.streak}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.streak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.overall.inProgress}
            </div>
            <p className="text-xs text-muted-foreground">
              questions started
            </p>
          </CardContent>
        </Card>

        {/* Total Solved */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.overall.solved}
            </div>
            <p className="text-xs text-muted-foreground">
              questions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.difficulty).map(([difficulty, data]) => (
              <div key={difficulty} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className={getDifficultyColor(difficulty)}>
                    {difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {data.solved}/{data.total}
                  </span>
                </div>
                <Progress 
                  value={data.total > 0 ? (data.solved / data.total) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Top Topics Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTopics.map(([topic, data]) => (
              <div key={topic} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{topic}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.solved}/{data.total}
                  </span>
                </div>
                <Progress 
                  value={data.total > 0 ? (data.solved / data.total) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Activity (Curated Questions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {activity.questionTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {activity.difficulty}
                    </Badge>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground">
                <strong>Note:</strong> Progress shown is for curated questions only. 
                Your imported questions are tracked separately in the DSA practice section.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
