import { DashboardHeader } from "@/components/header/DashboardHeader";
import { checkIfUserCompletedOnboarding } from "@/lib/checkIfUserCompletedOnboarding";
import { getWorkspaceWithChat } from "@/lib/api";
import { notFound } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { db } from "@/lib/db";

interface Params {
  params: {
    workspace_id: string;
    chat_id: string;
  };
}

const Chat = async ({ params: { workspace_id, chat_id } }: Params) => {
  const session = await checkIfUserCompletedOnboarding(
    `/dashboard/workspace/${workspace_id}/chat/${chat_id}`
  );

  const workspace = await getWorkspaceWithChat(workspace_id, session.user.id);

  if (!workspace) return notFound();

  // Get or create conversation
  let conversation = await db.conversation.findFirst({
    where: {
      id: chat_id,
      workspaceId: workspace_id
    }
  });

  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        id: chat_id,
        workspaceId: workspace_id
      }
    });
  }

  // Get initial messages
  const initialMessages = await db.message.findMany({
    where: {
      conversationId: chat_id,
      isDeleted: false
    },
    include: {
      sender: true, // Get complete User object
      replyTo: {
        include: {
          sender: true, // Get complete User object
          reactions: {
            include: {
              user: true
            }
          },
          readBy: {
            include: {
              user: true
            }
          }
        }
      },
      reactions: {
        include: {
          user: true // Get complete User object
        }
      },
      readBy: {
        include: {
          user: true // Get complete User object
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 50
  });

  // Create workspace object with conversation data for ChatContainer
  const workspaceWithConversation = {
    ...workspace,
    conversation: {
      id: conversation.id,
      messages: initialMessages, // Use raw messages without date conversion
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
            name: "CHAT",
            href: `/dashboard/workspace/${workspace_id}/chat/${chat_id}`,
            useTranslate: true,
          },
        ]}
      />
      <main className="h-full w-full p-4">
        <ChatContainer workspace={workspaceWithConversation} />
      </main>
    </>
  );
};

export default Chat;
