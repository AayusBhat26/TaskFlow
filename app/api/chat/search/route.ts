import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1),
  conversationId: z.string(),
  filters: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    senderId: z.string().optional(),
    messageType: z.string().optional(),
    hasAttachments: z.boolean().optional(),
  }).optional(),
  limit: z.number().min(1).max(50).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getToken({ req });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, conversationId, filters, limit, offset } = searchSchema.parse(body);

    // Verify user has access to the conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        workspace: {
          subscribers: {
            some: {
              userId: user.id as string
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found or no access" }, { status: 404 });
    }

    // Build search conditions
    const searchConditions: any = {
      conversationId,
      isDeleted: false,
      OR: [
        {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          attachments: {
            some: {
              originalName: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        }
      ]
    };

    // Apply filters if provided
    if (filters) {
      if (filters.fromDate) {
        searchConditions.createdAt = {
          ...searchConditions.createdAt,
          gte: new Date(filters.fromDate)
        };
      }
      
      if (filters.toDate) {
        searchConditions.createdAt = {
          ...searchConditions.createdAt,
          lte: new Date(filters.toDate)
        };
      }

      if (filters.senderId) {
        searchConditions.senderId = filters.senderId;
      }

      if (filters.messageType) {
        searchConditions.messageType = filters.messageType;
      }

      if (filters.hasAttachments !== undefined) {
        if (filters.hasAttachments) {
          searchConditions.attachments = {
            some: {}
          };
        } else {
          searchConditions.attachments = {
            none: {}
          };
        }
      }
    }

    // Search messages
    const [messages, totalCount] = await Promise.all([
      db.message.findMany({
        where: searchConditions,
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
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset,
      }),
      db.message.count({
        where: searchConditions
      })
    ]);

    return NextResponse.json({
      messages,
      totalCount,
      hasMore: offset + limit < totalCount,
      query,
      filters,
    });

  } catch (error) {
    console.error("Error searching messages:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
