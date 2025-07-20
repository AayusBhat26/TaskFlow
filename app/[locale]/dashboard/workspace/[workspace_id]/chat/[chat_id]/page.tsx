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

  // Get or create conversation if it doesn't exist
  let conversation = workspace.conversation;
  
  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        id: chat_id,
        workspaceId: workspace_id
      },
      include: {
        messages: {
          where: {
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
          }
        }
      }
    });
    
    // Update workspace with the new conversation
    workspace.conversation = conversation;
  }

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
        <ChatContainer workspace={workspace} />
      </main>
    </>
  );
};

export default Chat;
