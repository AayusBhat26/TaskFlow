import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

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

  if (!result.success)
    return NextResponse.json("ERRORS.WRONG_DATA", { status: 401 });

  const { id } = result.data;

  try {
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

    await db.notification.updateMany({
      where: {
        id,
      },
      data: {
        clicked: true,
      },
    });

    return NextResponse.json("OK", { status: 200 });
  } catch (_) {
    return NextResponse.json("ERRORS.DB_ERROR", { status: 405 });
  }
}
