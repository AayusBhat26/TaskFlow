import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalServicesSchema } from "@/schema/externalServicesSchema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 400,
      statusText: "Unauthorized User",
    });
  }

  try {
    const body = await request.json();
    const result = externalServicesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json("ERRORS.WRONG_DATA", { status: 400 });
    }

    const { leetcodeUsername, codeforcesUsername, redditUsername, githubUsername, emailIds } = result.data;

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        statusText: "User not Found",
      });
    }

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        leetcodeUsername: leetcodeUsername || null,
        codeforcesUsername: codeforcesUsername || null,
        redditUsername: redditUsername || null,
        githubUsername: githubUsername || null,
        emailIds: emailIds || [],
      },
    });

    return NextResponse.json({
      message: "External services updated successfully",
      user: {
        id: updatedUser.id,
        leetcodeUsername: updatedUser.leetcodeUsername,
        codeforcesUsername: updatedUser.codeforcesUsername,
        redditUsername: updatedUser.redditUsername,
        githubUsername: updatedUser.githubUsername,
        emailIds: updatedUser.emailIds,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("External services update error:", error);
    return NextResponse.json("ERRORS.DB_ERROR", { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 400,
      statusText: "Unauthorized User",
    });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        leetcodeUsername: true,
        codeforcesUsername: true,
        redditUsername: true,
        githubUsername: true,
        emailIds: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        statusText: "User not Found",
      });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("Get external services error:", error);
    return NextResponse.json("ERRORS.DB_ERROR", { status: 500 });
  }
}
