import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createMentionNotificationSchema = z.object({
  mentionedUserIds: z.array(z.string()),
  messageId: z.string(),
  workspaceId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mentionedUserIds, messageId, workspaceId } = createMentionNotificationSchema.parse(body);

    // Check if user has access to this workspace
    const userSubscription = await db.subscription.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!userSubscription) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify the message exists and belongs to this workspace
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          workspaceId,
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Create notifications for mentioned users (excluding the sender)
    const notificationsToCreate = mentionedUserIds
      .filter(userId => userId !== session.user.id) // Don't notify yourself
      .map(userId => ({
        userId,
        notifyCreatorId: session.user.id,
        workspaceId,
        messageId,
        notifyType: "CHAT_MENTION" as const,
        seen: false,
        clicked: false,
      }));

    if (notificationsToCreate.length > 0) {
      await db.notification.createMany({
        data: notificationsToCreate,
      });
    }

    return NextResponse.json({ 
      success: true, 
      notificationsCreated: notificationsToCreate.length 
    });
  } catch (error) {
    console.error("Error creating mention notifications:", error);
    return NextResponse.json(
      { error: "Failed to create mention notifications" },
      { status: 500 }
    );
  }
}
