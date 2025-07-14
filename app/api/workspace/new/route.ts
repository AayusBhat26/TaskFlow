import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRandomWorkspaceColor } from "@/lib/getRandomWorkspaceColor";
import { MAX_USER_WORKSPACES } from "@/lib/options";
import { apiWorkspaceSchema } from "@/schema/workspaceSchema";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 400,
      statusText: "Unauthorized User",
    });
  }

  const body: unknown = await request.json();

  const result = apiWorkspaceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json("ERRORS.WRONG_DATA", { status: 401 });
  }

  const { workspaceName, file } = result.data;

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        createdWorkspaces: {
          select: {
            id: true,
            name: true,
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

    if (user.createdWorkspaces.length === MAX_USER_WORKSPACES) {
      return new NextResponse("ERRORS.TOO_MANY_WORKSPACES", { status: 402 });
    }

    const theSameWorkspaceName = user.createdWorkspaces.find(
      (workspace) =>
        workspace.name.toLowerCase() === workspaceName.toLowerCase()
    );

    if (theSameWorkspaceName) {
      return new NextResponse("ERRORS.SAME_NAME_WORKSPACE", { status: 403 });
    }

    const color = getRandomWorkspaceColor();

    const workspace = await db.workspace.create({
      data: {
        creatorId: user.id,
        name: workspaceName,
        image: file,
        color,
        inviteCode: uuidv4(),
        adminCode: uuidv4(),
        canEditCode: uuidv4(),
        readOnlyCode: uuidv4(),
      },
    });

    await db.subscription.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        userRole: "OWNER",
      },
    });

    const conversation = await db.conversation.create({
      data: {
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(workspace, { status: 200 });
  } catch (_) {
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
}
