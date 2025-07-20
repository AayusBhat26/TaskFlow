import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const getMembersSchema = z.object({
  workspaceId: z.string(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = getMembersSchema.parse(params);

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

    // Get all workspace members
    const members = await db.subscription.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: {
          username: 'asc',
        },
      },
    });

    const membersList = members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      name: member.user.name,
      image: member.user.image,
      email: member.user.email,
      role: member.userRole,
    }));

    return NextResponse.json({ members: membersList });
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace members" },
      { status: 500 }
    );
  }
}
