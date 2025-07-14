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
    const { isOnline, lastSeen } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json("ERRORS.WRONG_DATA", { status: 400 });
    }

    const updateData: any = {
      isOnline,
    };

    if (lastSeen) {
      updateData.lastSeen = new Date(lastSeen);
    } else if (!isOnline) {
      updateData.lastSeen = new Date();
    }

    await db.user.update({
      where: {
        id: session.user.id
      },
      data: updateData
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json("ERRORS.SERVER_ERROR", { status: 500 });
  }
}
