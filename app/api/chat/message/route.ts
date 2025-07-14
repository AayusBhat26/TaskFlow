import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
        _count: {
          select: {
            reactions: true,
            readBy: true,
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
