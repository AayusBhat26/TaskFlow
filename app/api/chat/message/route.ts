import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Helper function to extract mentions from message content
const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]); // username without @
  }
  
  return mentions;
};

// Helper function to resolve usernames to user IDs
const resolveUsernamesToIds = async (usernames: string[], workspaceId: string): Promise<string[]> => {
  if (usernames.length === 0) return [];
  
  const users = await db.user.findMany({
    where: {
      username: {
        in: usernames,
      },
      // Check if users are members of the workspace
      subscriptions: {
        some: {
          workspaceId,
        },
      },
    },
    select: {
      id: true,
    },
  });
  
  return users.map(user => user.id);
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, content, messageType = "TEXT", replyToId } = await request.json();

    // Check if conversationId is actually a workspaceId (for initial conversation creation)
    let actualConversationId = conversationId;
    let conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        workspace: {
          include: {
            subscribers: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    // If conversation not found, try to find by workspaceId and create if needed
    if (!conversation) {
      // Check if user has access to the workspace
      const workspace = await db.workspace.findUnique({
        where: { 
          id: conversationId, // Using conversationId as workspaceId
          subscribers: {
            some: { userId: session.user.id }
          }
        },
      });

      if (!workspace) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Create conversation for this workspace
      conversation = await db.conversation.create({
        data: {
          workspaceId: conversationId,
        },
        include: {
          workspace: {
            include: {
              subscribers: {
                where: { userId: session.user.id },
              },
            },
          },
        },
      });
      
      actualConversationId = conversation.id;
    }

    if (!conversation?.workspace || conversation.workspace.subscribers.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        conversationId: actualConversationId,
        senderId: session.user.id,
        content,
        messageType,
        replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            readBy: true,
            attachments: true,
          },
        },
      },
    });

    // Handle mentions - create notifications
    const mentionedUsernames = extractMentions(content);
    if (mentionedUsernames.length > 0) {
      try {
        const mentionedUserIds = await resolveUsernamesToIds(mentionedUsernames, conversation.workspaceId);
        
        if (mentionedUserIds.length > 0) {
          // Create mention notifications
          const notificationsToCreate = mentionedUserIds
            .filter(userId => userId !== session.user.id) // Don't notify yourself
            .map(userId => ({
              userId,
              notifyCreatorId: session.user.id,
              workspaceId: conversation.workspaceId,
              messageId: message.id,
              notifyType: "CHAT_MENTION" as const,
              seen: false,
              clicked: false,
            }));

          if (notificationsToCreate.length > 0) {
            await db.notification.createMany({
              data: notificationsToCreate,
            });
          }
        }
      } catch (mentionError) {
        console.error("Error creating mention notifications:", mentionError);
        // Don't fail the message creation if notification creation fails
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
