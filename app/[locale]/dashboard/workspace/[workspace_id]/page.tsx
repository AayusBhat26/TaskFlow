import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { LeaveWorkspace } from "@/components/workspaceMainPage/shortcuts/leaveWorkspace/LeaveWorkspace";
import { MindMap } from "@/components/mindMaps/MindMap";
import { PermissionIndicator } from "@/components/workspaceMainPage/shortcuts/permissionIndicator/Permissionindicator";
import { FilterContainer } from "@/components/workspaceMainPage/filter/FilterContainer";
import { ShortcutContainer } from "@/components/workspaceMainPage/shortcuts/ShortcutContainer";
import {
  getUserWorkspaceRole,
  getWorkspace,
  getConversation,
} from "@/lib/api";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { FilterByUsersAndTagsInWorkspaceProvider } from "@/context/FilterByUsersAndTagsInWorkspace";
import { RecentActivityContainer } from "@/components/workspaceMainPage/recentActivity/RecentActivityContainer";
import Chat from "@/components/chat";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
  };
}

const Workspace = async ({ params: { workspace_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}`
  );

  const [workspace, userRole] = await Promise.all([
    getWorkspace(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
  ]);

  if (!workspace || !userRole) notFound();

  // Try to get conversation, but don't fail if it doesn't exist
  let conversation = null;
  try {
    conversation = await getConversation(workspace_id, session.user.id);
  } catch (error) {
    console.warn("Could not fetch conversation, will create on first message");
  }

  // Create extended workspace object for chat
  const extendedWorkspace = {
    ...workspace,
    conversation,
    subscribers: [], // This would be populated from the actual subscribers
  };

  return (
    <FilterByUsersAndTagsInWorkspaceProvider>
      <DashboardHeader
        addManualRoutes={[
          {
            name: "DASHBOARD",
            href: "/dashboard",
            useTranslate: true,
          },
          {
            name: workspace.name,
            href: `/dashboard/workspace/${workspace_id}`,
          },
        ]}
      >
        {(userRole === "ADMIN" || userRole === "OWNER") && (
          <InviteUsers workspace={workspace} />
        )}
        {userRole !== "OWNER" && <LeaveWorkspace workspace={workspace} />}
        <AddTaskShortcut userId={session.user.id} />
      </DashboardHeader>
      <main className="flex flex-col gap-2 w-full">
        <ShortcutContainer workspace={workspace} userRole={userRole} />
        <FilterContainer sessionUserId={session.user.id} />
        <RecentActivityContainer
          userId={session.user.id}
          workspaceId={workspace.id}
        />
      </main>
      
      {/* Chat Component */}
      <Chat workspace={extendedWorkspace} />
    </FilterByUsersAndTagsInWorkspaceProvider>
  );
};

export default Workspace;
