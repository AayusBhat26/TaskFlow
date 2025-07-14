"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";

import { useNewMindMap } from "@/hooks/useNewMindMap";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  workspaceId: string;
}

export const NewMindMap = ({ workspaceId }: Props) => {
  const t = useTranslations("SIDEBAR.WORKSPACE_OPTIONS");

  const { newMindMap, isPending } = useNewMindMap(workspaceId);
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        newMindMap();
      }}
      className="justify-start items-center gap-2"
      variant="ghost"
      size="sm"
    >
      <Plus size={16} />
      {isPending ? (
        <LoadingState loadingText={t("ADD_MIND_MAP_PENDING")} />
      ) : (
        t("ADD_MIND_MAP")
      )}
    </Button>
  );
};
