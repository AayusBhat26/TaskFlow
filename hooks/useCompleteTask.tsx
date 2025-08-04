"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { playTaskCompletionSound } from "@/lib/soundEffects";
import axios from "axios";

interface CompleteTaskData {
  taskId: string;
  workspaceId: string;
}

interface CompleteTaskResponse {
  success: boolean;
  task: any;
  pointsEarned: number;
  totalPoints: number;
  message: string;
  leveledUp?: boolean;
  unlockedAchievements?: string[];
}

export const useCompleteTask = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompleteTaskData): Promise<CompleteTaskResponse> => {
      const response = await axios.post('/api/task/complete', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Show success message with points earned
      toast({
        title: "🎉 Task Completed!",
        description: data.message,
      });

      // Show achievement notifications
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        setTimeout(() => {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `You've unlocked ${data.unlockedAchievements.length} new achievement(s)!`,
            duration: 5000,
          });
        }, 1000);
      }

      // Show level up notification
      if (data.leveledUp) {
        setTimeout(() => {
          toast({
            title: "🎊 LEVEL UP!",
            description: "Congratulations! You've leveled up!",
            duration: 7000,
          });
        }, 2000);
      }

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['getWorkspaceRecentActivity'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['gaming'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to complete task';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
