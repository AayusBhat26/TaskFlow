"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/ui/loadingState";

interface PointTransaction {
  id: string;
  points: number;
  type: 'POMODORO_COMPLETED' | 'TASK_COMPLETED' | 'MANUAL_ADJUSTMENT';
  description: string;
  createdAt: string;
}

interface PointsData {
  user: {
    id: string;
    username: string;
    totalPoints: number;
  };
  transactions: PointTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: Record<string, { totalPoints: number; count: number }>;
}

async function fetchUserPoints(page = 1): Promise<PointsData> {
  const response = await fetch(`/api/points?page=${page}&limit=20`);
  if (!response.ok) {
    throw new Error('Failed to fetch points data');
  }
  return response.json();
}

export const PointsDisplay = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: pointsData, isLoading, error } = useQuery({
    queryKey: ['userPoints', currentPage],
    queryFn: () => fetchUserPoints(currentPage),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'POMODORO_COMPLETED':
        return <Clock className="h-4 w-4" />;
      case 'TASK_COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'POMODORO_COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'TASK_COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center justify-center p-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error || !pointsData) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-red-500">Error loading points</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Points</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{pointsData.user.totalPoints}</div>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </div>
            </div>
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Points History
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    {pointsData.stats.POMODORO_COMPLETED && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-900">
                            {pointsData.stats.POMODORO_COMPLETED.totalPoints}
                          </div>
                          <div className="text-xs text-blue-600">
                            {pointsData.stats.POMODORO_COMPLETED.count} sessions
                          </div>
                        </div>
                      </div>
                    )}
                    {pointsData.stats.TASK_COMPLETED && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-900">
                            {pointsData.stats.TASK_COMPLETED.totalPoints}
                          </div>
                          <div className="text-xs text-green-600">
                            {pointsData.stats.TASK_COMPLETED.count} tasks
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction History */}
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {pointsData.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getTypeIcon(transaction.type)}
                            <div>
                              <div className="text-sm font-medium">
                                {transaction.description}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </div>
                            </div>
                          </div>
                          <Badge className={getTypeColor(transaction.type)}>
                            +{transaction.points}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Pagination */}
                  {pointsData.pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pointsData.pagination.hasPrev}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pointsData.pagination.page} of {pointsData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pointsData.pagination.hasNext}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
