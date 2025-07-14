import { AddTaskShortcut } from "@/components/addTaskShortCut/AddTaskShortcut";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { InviteUsers } from "@/components/inviteUsers/InviteUsers";
import { TaskContainer } from "@/components/tasks/editable/container/TaskContainer";
import { NewTask } from "@/components/tasks/newTask/NewTask";
import { ReadOnlyContent } from "@/components/tasks/readOnly/ReadOnlyContent";
import { getTask, getUserWorkspaceRole, getWorkspace } from "@/lib/api";
import { changeCodeToEmoji } from "@/lib/changeCodeToEmoji";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { notFound } from "next/navigation";

interface Params {
  params: {
    workspace_id: string;
    task_id: string;
  };
}

const Task = async ({ params: { workspace_id, task_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/tasks/task/${task_id}`
  );

  const [workspace, userRole, task] = await Promise.all([
    getWorkspace(workspace_id, session.user.id),
    getUserWorkspaceRole(workspace_id, session.user.id),
    getTask(task_id, session.user.id),
  ]);

  if (!workspace || !userRole || !task) notFound();

  const isSavedByUser =
    task.savedTask?.find((task) => task.userId === session.user.id) !==
    undefined;

  return (
    <>
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
          {
            name: `${task.title ? task.title : "UNTITLED"}`,
            emoji: changeCodeToEmoji(task.emoji),
            href: "/",
            useTranslate: task.title ? false : true,
          },
        ]}
      >
        {(userRole === "ADMIN" || userRole === "OWNER") && (
          <InviteUsers workspace={workspace} />
        )}
        <AddTaskShortcut userId={session.user.id} />
      </DashboardHeader>
      <main className="flex flex-col gap-2">
        <ReadOnlyContent
          task={task}
          isSavedByUser={isSavedByUser}
          userRole={userRole}
        />
      </main>
    </>
  );
};

export default Task;
