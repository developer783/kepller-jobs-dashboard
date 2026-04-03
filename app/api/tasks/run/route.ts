import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = process.env.APIFY_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "APIFY_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const taskId =
      typeof body?.taskId === "string" ? body.taskId.trim() : "";

    if (!taskId) {
      return NextResponse.json(
        { error: "A valid taskId is required." },
        { status: 400 }
      );
    }

    const client = new ApifyClient({ token });
    const run = await client.task(taskId).start();

    return NextResponse.json({
      success: true,
      runId: run.id,
      status: run.status,
      startedAt: run.startedAt,
      taskId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start the Apify task.",
      },
      { status: 500 }
    );
  }
}
