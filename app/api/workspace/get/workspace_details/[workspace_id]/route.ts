import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface Params {
  params: {
    workspace_id: string;
  };
}

export const GET = async (
  request: Request,
  { params: { workspace_id } }: Params
) => {
  const url = new URL(request.url);

  const userId = url.searchParams.get("userId");
  const includeChat = url.searchParams.get("includeChat") === "true";

  if (!userId) return NextResponse.json("ERRORS.NO_USER_API", { status: 404 });

  try {
    const workspace = await db.workspace.findUnique({
      where: {
        id: workspace_id,
        subscribers: {
          some: {
            userId,
          },
        },
      },
      include: includeChat
        ? {
            chatMessages: {
              where: {
                // Optionally filter messages, e.g., isDeleted: false if such a field exists
              },
              include: {
                author: true,
                workspace: true,
              },
              orderBy: {
                createdAt: "asc",
              },
              take: 50,
            },
            subscribers: {
              include: {
                user: true,
              },
            },
          }
        : {
            subscribers: {
              include: {
                user: true,
              },
            },
          },
    });

    if (!workspace)
      return NextResponse.json("Workspace not found", { status: 200 });

    return NextResponse.json(workspace, { status: 200 });
  } catch (err) {
    console.error("Error fetching workspace details:", err);
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
};
