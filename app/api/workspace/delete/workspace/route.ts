import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAccountSchema } from "@/schema/deleteAccountSchema";
import {
  apiWorkspaceDelete,
  apiWorkspaceDeletePicture,
} from "@/schema/workspaceSchema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 400,
      statusText: "Unauthorized User",
    });
  }

  const body: unknown = await request.json();
  const result = apiWorkspaceDelete.safeParse(body);

  if (!result.success) {
    return NextResponse.json("ERRORS.WRONG_DATA", { status: 401 });
  }

  const { id, workspaceName } = result.data;

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
      },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        statusText: "User not Found",
      });
    }

    if (
      user.subscriptions[0].userRole === "CAN_EDIT" ||
      user.subscriptions[0].userRole === "READ_ONLY"
    ) {
      return NextResponse.json("ERRORS.NO_PERMISSION", { status: 403 });
    }

    const workspace = await db.workspace.findUnique({
      where: {
        id,
      },
    });

    if (!workspace) {
      return new NextResponse("ERRORS.NO_WORKSPACE", {
        status: 404,
        statusText: "User not Found",
      });
    }

    if (workspace.name !== workspaceName) {
      return NextResponse.json("ERRORS.WRONG_WORKSPACE_NAME", { status: 403 });
    }

    await db.workspace.delete({
      where: {
        id,
      },
    });

    return NextResponse.json("OK", { status: 200 });
  } catch (_) {
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
}
