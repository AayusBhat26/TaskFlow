import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized User",
    });
  }

  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json("ERRORS.WORKSPACE_ID_REQUIRED", { status: 400 });
    }

    // Verify user has access to this workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        subscribers: {
          some: {
            userId: session.user.id
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json("ERRORS.WORKSPACE_NOT_FOUND", { status: 404 });
    }

    // Get all users in the workspace
    const workspaceUsers = await db.subscription.findMany({
      where: {
        workspaceId: workspaceId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            isOnline: true,
            lastSeen: true
          }
        }
      }
    });

    const users = workspaceUsers.map(sub => ({
      id: sub.user.id,
      username: sub.user.username,
      image: sub.user.image,
      isOnline: sub.user.isOnline,
      lastSeen: sub.user.lastSeen,
      role: sub.userRole
    }));

    return NextResponse.json(users);

  } catch (error) {
    console.error("Get workspace users error:", error);
    return NextResponse.json("ERRORS.SERVER_ERROR", { status: 500 });
  }
}
