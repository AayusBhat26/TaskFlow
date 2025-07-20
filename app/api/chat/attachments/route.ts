import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { z } from "zod";

const attachmentSchema = z.object({
  messageId: z.string(),
  files: z.array(z.object({
    url: z.string(),
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    key: z.string(),
  }))
});

export async function POST(req: NextRequest) {
  try {
    const user = await getToken({ req });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messageId, files } = attachmentSchema.parse(body);

    // Verify the message exists and user has access
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          workspace: {
            subscribers: {
              some: {
                userId: user.id as string
              }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found or no access" }, { status: 404 });
    }

    // Create file attachments
    const attachments = await Promise.all(
      files.map(file =>
        db.fileAttachment.create({
          data: {
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            url: file.url,
            key: file.key,
            messageId: messageId,
            uploadedById: user.id as string,
          },
        })
      )
    );

    return NextResponse.json({ 
      success: true, 
      attachments: attachments.map(att => ({
        id: att.id,
        filename: att.filename,
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        url: att.url,
        createdAt: att.createdAt,
      }))
    });

  } catch (error) {
    console.error("Error saving file attachments:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getToken({ req });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const attachmentId = url.searchParams.get("id");

    if (!attachmentId) {
      return NextResponse.json({ error: "Attachment ID required" }, { status: 400 });
    }

    // Verify the attachment exists and user has access
    const attachment = await db.fileAttachment.findFirst({
      where: {
        id: attachmentId,
        message: {
          conversation: {
            workspace: {
              subscribers: {
                some: {
                  userId: user.id as string
                }
              }
            }
          }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found or no access" }, { status: 404 });
    }

    // Delete from database
    await db.fileAttachment.delete({
      where: { id: attachmentId }
    });

    // TODO: Delete from UploadThing storage using the key
    // This would require calling UploadThing's delete API

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting file attachment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
