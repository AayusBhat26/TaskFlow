"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Warning from '@/components/ui/warning';
import { 
  Code, 
  GitBranch, 
  MessageSquare, 
  Mail, 
  TrendingUp, 
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useExternalServices } from '@/hooks/useExternalServices';
import Link from 'next/link';

// Simple loading skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export const ExternalServicesDashboardWidget = () => {
  const {
    data,
    insights,
    dailyDigest,
    isLoading,
    isRefetching,
    error,
    hasData,
    refreshData,
  } = useExternalServices();

  if (isLoading) {
    return <ExternalServicesLoading />;
  }

  if (error) {
    return <ExternalServicesError onRetry={refreshData} />;
  }

  if (!hasData || !data) {
    return null; // Don't show anything if no data
  }

  return (
    <div className="space-y-4">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">External Services Overview</h2>
          <p className="text-sm text-muted-foreground">Your latest activity across platforms</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(data.lastUpdated).toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/external-services">
            <Button variant="default" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily Digest Card */}
      {dailyDigest && (dailyDigest.highlights.length > 0 || dailyDigest.actionItems.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Today's Activity
            </CardTitle>
            <CardDescription>{dailyDigest.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyDigest.highlights.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Highlights</h4>
                  <ul className="space-y-1">
                    {dailyDigest.highlights.slice(0, 3).map((highlight: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {dailyDigest.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Action Items</h4>
                  <ul className="space-y-1">
                    {dailyDigest.actionItems.slice(0, 3).map((item: string, index: number) => (
                      <li key={index} className="text-sm text-destructive">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.leetcode && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                LeetCode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Solved</span>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {data.leetcode.totalSolved}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ranking</span>
                  <Badge variant="outline" className="text-xs">
                    #{data.leetcode.ranking.toLocaleString()}
                  </Badge>
                </div>
                {data.leetcode.recentSubmissions.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Latest: {data.leetcode.recentSubmissions[0].title}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-accent-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  Real-time data
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.codeforces && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded"></div>
                Codeforces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rating</span>
                  <Badge variant="secondary">{data.codeforces.user.rating}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rank</span>
                  <Badge variant="outline">{data.codeforces.user.rank}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Solved</span>
                  <Badge variant="default">{data.codeforces.solvedProblems}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.github && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="w-3 h-3" />
                GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repos</span>
                  <Badge variant="secondary">{data.github.user.public_repos}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stars</span>
                  <Badge variant="outline">{data.github.totalStars}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Streak</span>
                  <Badge variant="default">{data.github.currentStreak} days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.reddit && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Reddit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Karma</span>
                  <Badge variant="secondary">{data.reddit.totalKarma.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Posts</span>
                  <Badge variant="outline">{data.reddit.postsCount}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Comments</span>
                  <Badge variant="default">{data.reddit.commentsCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.email && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Unread</span>
                  <Badge variant="destructive">{data.email.totalUnread}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Today</span>
                  <Badge variant="secondary">{data.email.totalToday}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <Badge variant="outline">{data.email.totalWeek}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {insights.slice(0, 3).map((insight: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {insight}
                </li>
              ))}
            </ul>
            {insights.length > 3 && (
              <Link href="/dashboard/external-services" className="text-sm text-primary hover:underline mt-2 inline-block">
                View all insights →
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalServicesDashboardWidget;

const ExternalServicesLoading = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48 mt-1" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-5 w-10" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ExternalServicesError = ({ onRetry }: { onRetry: () => void }) => (
  <Warning className="flex items-center justify-between">
    <span>Failed to load external services data.</span>
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  </Warning>
);
