import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotifyType } from "@prisma/client";

import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 400,
      statusText: "Unauthorized User",
    });
  }

  const body: unknown = await request.json();

  const result = z
    .object({
      id: z.string(),
    })
    .safeParse(body);

  if (!result.success) {
    return NextResponse.json("ERRORS.WRONG_DATA", { status: 401 });
  }

  const { id } = result.data;

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        subscriptions: {
          where: {
            workspaceId: id,
          },
          select: {
            userRole: true,
          },
        },
        savedMindMaps: {
          where: {
            mindMap: {
              workspaceId: id,
            },
          },
        },
        savedTask: {
          where: {
            task: {
              workspaceId: id,
            },
          },
        },
        assignedToTask: {
          where: {
            task: {
              workspaceId: id,
            },
          },
        },
        assignedToMindMap: {
          where: {
            mindMap: {
              workspaceId: id,
            },
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        statusText: "User not Found",
      });
    }

    if (user.subscriptions[0].userRole === "OWNER") {
      return NextResponse.json("ERRORS.CANT_LEAVE", { status: 403 });
    }

    const savedMindMapsIds = user.savedMindMaps.map((mindMap) => mindMap.id);
    const savedTaskIds = user.savedMindMaps.map((task) => task.id);

    const assignedToMindMapIds = user.assignedToMindMap.map(
      (mindMap) => mindMap.id
    );
    const assignedToTaskIds = user.assignedToTask.map((task) => task.id);

    await db.savedMindMaps.deleteMany({
      where: {
        id: { in: savedMindMapsIds },
      },
    });

    await db.savedTask.deleteMany({
      where: {
        id: { in: savedTaskIds },
      },
    });

    await db.assignedToTask.deleteMany({
      where: {
        id: { in: assignedToTaskIds },
      },
    });

    await db.assignedToMindMap.deleteMany({
      where: {
        id: { in: assignedToMindMapIds },
      },
    });

    await db.subscription.delete({
      where: {
        userId_workspaceId: {
          workspaceId: id,
          userId: session.user.id,
        },
      },
    });

    const workspaceUsers = await db.subscription.findMany({
      where: {
        workspaceId: id,
      },
      select: {
        userId: true,
      },
    });

    const notificationsData = workspaceUsers.map((user) => ({
      notifyCreatorId: session.user.id,
      userId: user.userId,
      workspaceId: id,
      notifyType: NotifyType.USER_LEFT_WORKSPACE,
    }));

    await db.notification.createMany({
      data: notificationsData,
    });

    return NextResponse.json("ok", { status: 200 });
  } catch (_) {
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
}
