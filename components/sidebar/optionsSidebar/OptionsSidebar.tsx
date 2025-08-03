"use client";

import { usePathname } from "next/navigation";
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

  // Handle locale in route (e.g., /en/dashboard/workspace/...)
  const segments = pathname.split("/");
  // ['', 'en', 'dashboard', 'workspace', 'cmd1sn48b00046gusaicyf8ls', ...]
  const hasLocale = segments.length > 2 && segments[1].length === 2;
  const workspaceId = hasLocale ? segments[4] : segments[3];
  const urlAdditionalId = hasLocale ? segments[7] : segments[6];

  // Build route strings with locale if present
  const base = hasLocale ? `/${segments[1]}` : "";

  if (
    pathname === `${base}/dashboard` ||
    pathname === `${base}/dashboard/starred` ||
    pathname === `${base}/dashboard/calendar` ||
    (urlAdditionalId &&
      pathname ===
        `${base}/dashboard/workspace/${workspaceId}/tasks/task/${urlAdditionalId}/edit`) ||
    (urlAdditionalId &&
      pathname ===
        `${base}/dashboard/workspace/${workspaceId}/mind-maps/mind-map/${urlAdditionalId}/edit`)
  ) {
    return null;
  }
  return (
    <div className="border-r sm:w-80 w-64 h-full p-4 sm:py-6 flex flex-col justify-between">
      <ScrollArea className="h-full">
        {pathname.includes("/dashboard/settings") && (
          <Settings userAdminWorkspaces={userAdminWorkspaces} />
        )}
        {(pathname === `${base}/dashboard/workspace/${workspaceId}` ||
          pathname ===
            `${base}/dashboard/workspace/${workspaceId}/tasks/task/${urlAdditionalId}` ||
          pathname ===
            `${base}/dashboard/workspace/${workspaceId}/mind-maps/mind-map/${urlAdditionalId}`) && (
          <WorkspaceOptions workspaceId={workspaceId} />
        )}

        {(pathname === `${base}/dashboard/pomodoro` ||
          pathname === `${base}/dashboard/pomodoro/settings`) && <PomodoroLinks />}

        {pathname === `${base}/dashboard/assigned-to-me` && (
          <AssignedToMeFilter userWorkspaces={userWorkspaces} />
        )}
      </ScrollArea>

      <CreatedWorkspacesInfo createdNumber={createdWorkspaces} />
    </div>
  );
};
