import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiTagSchema } from "@/schema/tagSchema";

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
  const result = apiTagSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json("ERRORS.WRONG_DATA", { status: 401 });
  }

  const { id, color, tagName, workspaceId } = result.data;

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        subscriptions: {
          where: {
            workspaceId: workspaceId,
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

    if (user.subscriptions[0].userRole === "READ_ONLY") {
      return NextResponse.json("ERRORS.NO_PERMISSION", { status: 403 });
    }

    const workspace = await db.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        tags: {
          where: {
            workspaceId,
          },
          select: {
            name: true,
          },
        },
      },
    });

    if (!workspace)
      return NextResponse.json("ERRORS.NO_WORKSPACE", { status: 404 });

    const tagExist = workspace.tags.find(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (tagExist)
      return NextResponse.json("ERRORS.THE_SAME_TAG", { status: 405 });

    const newTag = await db.tag.create({
      data: {
        color,
        name: tagName,
        id,
        workspaceId,
      },
    });

    return NextResponse.json(newTag, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
}
