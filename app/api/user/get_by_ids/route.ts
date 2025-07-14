import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized User",
    });
  }

  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json("ERRORS.WRONG_DATA", { status: 400 });
    }

    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        username: true,
        image: true,
        isOnline: true,
        lastSeen: true
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Get users by IDs error:", error);
    return NextResponse.json("ERRORS.SERVER_ERROR", { status: 500 });
  }
}
