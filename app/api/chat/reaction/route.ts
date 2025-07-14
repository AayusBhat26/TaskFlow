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

    const { messageId, emoji } = await request.json();

    // Verify user has access to the message
    const message = await db.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            workspace: {
              include: {
                subscribers: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!message || !message.conversation.workspace || message.conversation.workspace.subscribers.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if reaction already exists
    const existingReaction = await db.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      return NextResponse.json({ error: "Reaction already exists" }, { status: 409 });
    }

    // Create the reaction
    const reaction = await db.messageReaction.create({
      data: {
        messageId,
        userId: session.user.id,
        emoji,
      },
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
    });

    return NextResponse.json(reaction);
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, emoji } = await request.json();

    // Delete the reaction
    const deletedReaction = await db.messageReaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    return NextResponse.json(deletedReaction);
  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
