"use client";

import { usePathname } from "next-intl/client";
import { Settings } from "./settingsOptions/Settings";
import { CreatedWorkspacesInfo } from "@/components/common/CreatedWorkspacesInfo";
import { Workspace } from "@prisma/client";
import { WorkspaceOptions } from "./workspaceOptions/WorkspaceOptions";
import { PomodoroLinks } from "./pomodoro/PomodoroLinks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssignedToMeFilter } from "./assignedToMeFilter/AssignedToMeFilter";

interface Props {
  createdWorkspaces: number;
  userAdminWorkspaces: Workspace[];
  userWorkspaces: Workspace[];
}

export const OptionsSidebar = ({
  createdWorkspaces,
  userAdminWorkspaces,
  userWorkspaces,
}: Props) => {
  const pathname = usePathname();
  if (pathname === "/dashboard") return null;

  const urlWorkspaceId: string | undefined = pathname.split("/")[3];
  const urlAdditionalId: string | undefined = pathname.split("/")[6];
  const workspaceId = urlWorkspaceId ? urlWorkspaceId : "";

  if (
    pathname === "/dashboard" ||
    pathname === "/dashboard/starred" ||
    pathname === "/dashboard/calendar" ||
    (urlAdditionalId &&
      pathname ===
        `/dashboard/workspace/${workspaceId}/tasks/task/${urlAdditionalId}/edit`) ||
    (urlAdditionalId &&
      pathname ===
        `/dashboard/workspace/${workspaceId}/mind-maps/mind-map/${urlAdditionalId}/edit`)
  ) {
    return null;
  }
  return (
    <div className="border-r sm:w-64 w-52 h-full p-4 sm:py-6 flex flex-col justify-between">
      <ScrollArea className="h-full">
        {pathname.includes("/dashboard/settings") && (
          <Settings userAdminWorkspaces={userAdminWorkspaces} />
        )}
        {(pathname === `/dashboard/workspace/${workspaceId}` ||
          pathname ===
            `/dashboard/workspace/${workspaceId}/tasks/task/${urlAdditionalId}` ||
          pathname ===
            `/dashboard/workspace/${workspaceId}/mind-maps/mind-map/${urlAdditionalId}`) && (
          <WorkspaceOptions workspaceId={workspaceId} />
        )}

        {(pathname === "/dashboard/pomodoro" ||
          pathname === "/dashboard/pomodoro/settings") && <PomodoroLinks />}

        {pathname === "/dashboard/assigned-to-me" && (
          <AssignedToMeFilter userWorkspaces={userWorkspaces} />
        )}
      </ScrollArea>

      <CreatedWorkspacesInfo createdNumber={createdWorkspaces} />
    </div>
  );
};
