import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { z } from "zod";

const updateMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const deleteMessageSchema = z.object({
  deleteType: z.enum(['soft', 'hard']).default('soft'),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getToken({ req });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;
    const body = await req.json();
    const { content } = updateMessageSchema.parse(body);

    // Verify the message exists and user owns it
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id as string,
        isDeleted: false,
      },
      include: {
        conversation: {
          include: {
            workspace: {
              include: {
                subscribers: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found or no permission" }, { status: 404 });
    }

    // Check if user has access to the workspace
    const hasAccess = message.conversation.workspace.subscribers.some(
      sub => sub.userId === user.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "No access to this workspace" }, { status: 403 });
    }

    // Update the message
    const updatedMessage = await db.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
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
      },
    });

    return NextResponse.json(updatedMessage);

  } catch (error) {
    console.error("Error updating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getToken({ req });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = params.id;
    const url = new URL(req.url);
    const deleteType = url.searchParams.get('type') || 'soft';

    // Verify the message exists and user owns it
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id as string,
      },
      include: {
        conversation: {
          include: {
            workspace: {
              include: {
                subscribers: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found or no permission" }, { status: 404 });
    }

    // Check if user has access to the workspace
    const hasAccess = message.conversation.workspace.subscribers.some(
      sub => sub.userId === user.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "No access to this workspace" }, { status: 403 });
    }

    if (deleteType === 'hard') {
      // Hard delete - completely remove the message
      await db.message.delete({
        where: { id: messageId }
      });
    } else {
      // Soft delete - mark as deleted
      await db.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          content: "This message was deleted",
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      messageId, 
      deleteType 
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
