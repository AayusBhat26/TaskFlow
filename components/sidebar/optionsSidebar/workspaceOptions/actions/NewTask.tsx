"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";

import { useNewTask } from "@/hooks/useNewTask";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  workspaceId: string;
}

export const NewTask = ({ workspaceId }: Props) => {
  const t = useTranslations("SIDEBAR.WORKSPACE_OPTIONS");

  const { newTask, isPending } = useNewTask(workspaceId);
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        newTask();
      }}
      className="justify-start items-center gap-2"
      variant="ghost"
      size="sm"
    >
      <Plus size={16} />
      {isPending ? <LoadingState /> : t("ADD_TASK")}
    </Button>
  );
};
