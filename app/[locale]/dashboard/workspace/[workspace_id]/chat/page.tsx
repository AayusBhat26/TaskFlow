import { getAuthSession } from "@/lib/auth";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { getWorkspaceWithChat } from "@/lib/api";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/header/DashboardHeader";
import { FullPageChat } from "@/components/chat/FullPageChat";
import { ChatDebugger } from "@/components/chat/ChatDebugger";
import { db } from "@/lib/db";

interface Params {
  params: {
    workspace_id: string;
  };
}

const WorkspaceChatPage = async ({ params: { workspace_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/chat`
  );

  const workspace = await getWorkspaceWithChat(workspace_id, session.user.id);

  if (!workspace) return notFound();

  // Get or create conversation for this workspace
  let conversation = await db.conversation.findFirst({
    where: {
      workspaceId: workspace_id
    }
  });

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        workspaceId: workspace_id
      }
    });
  }

  // Get initial messages for this workspace conversation
  const initialMessages = await db.message.findMany({
    where: {
      conversationId: conversation.id,
      isDeleted: false
    },
    include: {
      sender: true,
      replyTo: {
        include: {
          sender: true,
          reactions: {
            include: {
              user: true
            }
          },
          readBy: {
            include: {
              user: true
            }
          },
          attachments: {
            include: {
              uploadedBy: true
            }
          }
        }
      },
      reactions: {
        include: {
          user: true
        }
      },
      readBy: {
        include: {
          user: true
        }
      },
      attachments: {
        include: {
          uploadedBy: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 100
  });

  // Create workspace object with conversation data for ChatContainer
  const workspaceWithConversation = {
    ...workspace,
    conversation: {
      id: conversation.id,
      messages: initialMessages,
    },
    subscribers: [], // TODO: Populate this with actual subscribers if needed
  };

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
            name: "TEAM_CHAT",
            href: `/dashboard/workspace/${workspace_id}/chat`,
            useTranslate: true,
          },
        ]}
      />
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border overflow-hidden">
          <FullPageChat workspace={workspaceWithConversation} />
        </div>
      </main>
    </>
  );
};

export default WorkspaceChatPage;
