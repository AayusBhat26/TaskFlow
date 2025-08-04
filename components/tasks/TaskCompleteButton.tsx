"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, LoaderCircle } from "lucide-react";
import { useCompleteTask } from "@/hooks/useCompleteTask";
import { playTaskCompletionSound } from "@/lib/soundEffects";

interface TaskCompleteButtonProps {
  taskId: string;
  workspaceId: string;
  isCompleted?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const TaskCompleteButton = ({
  taskId,
  workspaceId,
  isCompleted = false,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: TaskCompleteButtonProps) => {
  const completeTaskMutation = useCompleteTask();

  const handleComplete = () => {
    if (isCompleted || disabled) return;
    
    // Play sound before making the API call for immediate feedback
    playTaskCompletionSound();
    
    completeTaskMutation.mutate({
      taskId,
      workspaceId,
    });
  };

  return (
    <Button
      variant={isCompleted ? "default" : variant}
      size={size}
      onClick={handleComplete}
      disabled={disabled || isCompleted || completeTaskMutation.isPending}
      className={className}
    >
      {completeTaskMutation.isPending ? (
        <>
          <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
          Completing...
        </>
      ) : isCompleted ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Completed
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete (+20 pts)
        </>
      )}
    </Button>
  );
};
