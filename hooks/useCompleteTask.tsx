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
      // Play task completion sound
      playTaskCompletionSound();
      
      // Show success message with points earned
      toast({
        title: "🎉 Task Completed!",
        description: data.message,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['getWorkspaceRecentActivity'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
