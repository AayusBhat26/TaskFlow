"use client";

import { CalendarRange, Files, Map, MessageCircle, PencilRuler, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import { NewTask } from "./actions/NewTask";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShortcuts } from "@/types/extended";
import { WorkspaceOption } from "./WorkspaceOption";
import { NewMindMap } from "./actions/NewMindMap";
import { UsersContainer } from "./usersList/UsersContainer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  workspaceId: string;
}

export const WorkspaceOptions = ({ workspaceId }: Props) => {
  const t = useTranslations("SIDEBAR.WORKSPACE_OPTIONS");
  const pathname = usePathname();

  const { data: workspaceShortcuts, isLoading } = useQuery({
    queryFn: async () => {
      const res = await fetch(
        `/api/workspace/get/workspace_shortcuts?workspaceId=${workspaceId}`
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data as WorkspaceShortcuts;
    },
    queryKey: ["getWrokspaceShortcuts", workspaceId],
  });

  return (
    <div>
      <div>
        <p>{t("SHORTCUTS")}</p>
        {!isLoading && workspaceShortcuts && (
          <div>
            <WorkspaceOption
              workspaceId={workspaceId}
              href={`tasks/task`}
              fields={workspaceShortcuts.tasks}
              defaultName="Untitled"
            >
              <PencilRuler size={16} />
              {t("TASKS")}
            </WorkspaceOption>
            <WorkspaceOption
              workspaceId={workspaceId}
              href={`mind-maps/mind-map`}
              fields={workspaceShortcuts.mindMaps}
              defaultName={t("DEFAULT_NAME")}
            >
              <Workflow size={16} />
              {t("MIND_MAPS")}
            </WorkspaceOption>
          </div>
        )}
        
        {/* Team Chat Navigation */}
        <Link 
          href={`/dashboard/workspace/${workspaceId}/chat`}
          className={cn(
            "flex items-center gap-2 w-full justify-start h-8 px-2 text-xs font-normal rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            pathname?.includes(`/dashboard/workspace/${workspaceId}/chat`) 
              ? "bg-accent text-accent-foreground" 
              : "text-foreground"
          )}
        >
          <MessageCircle size={16} />
          {t("WORKSPACE_CHAT")}
        </Link>
      </div>
      <div>
        <p className="text-xs sm:text-sm uppercase text-muted-foreground">
          {t("ACTIONS")}
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <NewTask workspaceId={workspaceId} />
          <NewMindMap workspaceId={workspaceId} />
        </div>
      </div>
      <UsersContainer />
    </div>
  );
};
