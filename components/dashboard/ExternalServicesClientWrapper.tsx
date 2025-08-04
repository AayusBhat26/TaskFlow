"use client";

import React from 'react';
import { ExternalServicesDashboard } from '@/components/dashboard/ExternalServicesDashboard';
import { useExternalServices, useExternalServiceInsights } from '@/hooks/useExternalServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Warning from '@/components/ui/warning';
import { RefreshCw, TrendingUp, Settings, Code } from 'lucide-react';
import Link from 'next/link';

// Simple loading skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const ExternalServicesClientWrapper = () => {
  const {
    data,
    insights: apiInsights,
    dailyDigest,
    isLoading,
    isRefetching,
    error,
    hasData,
    shouldShowEmptyState,
    refreshData,
  } = useExternalServices();

  const componentInsights = useExternalServiceInsights(data);

  if (isLoading) {
    return <ExternalServicesLoading />;
  }

  if (error) {
    return <ExternalServicesError onRetry={refreshData} />;
  }

  if (shouldShowEmptyState) {
    return <ExternalServicesEmptyState />;
  }

  if (!hasData || !data) {
    return <ExternalServicesEmptyState />;
  }

  // Combine API insights with component insights
  const enhancedData = {
    ...data,
    insights: [...(apiInsights || []), ...componentInsights.achievements],
    dailyDigest: dailyDigest || {
      title: 'Daily Activity Digest',
      summary: 'Your activity summary across all platforms',
      highlights: [],
      actionItems: []
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Stats Display - Updated to show other services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Codeforces Rating</p>
                <p className="text-3xl font-bold text-foreground">
                  {data.codeforces?.user?.rating || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Code className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-foreground">GitHub Repos</p>
                <p className="text-3xl font-bold text-foreground">
                  {data.github?.user?.public_repos || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-foreground">Reddit Karma</p>
                <p className="text-3xl font-bold text-foreground">
                  {data.reddit?.totalKarma || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* External Services Status */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                External Services Dashboard
              </h3>
              <p className="text-sm text-muted-foreground">
                Your activity across Codeforces, GitHub, Reddit, and email platforms
              </p>
            </div>
            <div className="text-right">
              <Link href="/dashboard/settings/external-services">
                <Button className="bg-primary hover:bg-primary/90">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Services
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
          <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
            🔍 Live API data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings/external-services">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage Services
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Insights */}
      {(componentInsights.achievements.length > 0 || 
        componentInsights.recommendations.length > 0 || 
        componentInsights.goals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {componentInsights.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏆 Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {componentInsights.achievements.slice(0, 3).map((achievement, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {componentInsights.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {componentInsights.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {componentInsights.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {componentInsights.goals.slice(0, 3).map((goal, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {goal}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Dashboard */}
      <ExternalServicesDashboard data={enhancedData} />
    </div>
  );
};

const ExternalServicesLoading = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const ExternalServicesError = ({ onRetry }: { onRetry: () => void }) => (
  <Warning className="flex items-center justify-between">
    <span>Failed to load external services data. Please try again.</span>
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry
    </Button>
  </Warning>
);

const ExternalServicesEmptyState = () => (
  <Card>
    <CardHeader>
      <CardTitle>No External Services Connected</CardTitle>
      <CardDescription>
        Connect your external accounts to see your progress and activity across platforms.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Link href="/dashboard/settings/external-services">
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Connect Services
        </Button>
      </Link>
    </CardContent>
  </Card>
);
