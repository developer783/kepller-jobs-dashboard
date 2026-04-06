import { ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = process.env.APIFY_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "APIFY_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId")?.trim() || "";

    if (!runId) {
      return NextResponse.json(
        { error: "A valid runId is required." },
        { status: 400 }
      );
    }

    const client = new ApifyClient({ token });
    const run = await client.run(runId).get();

    if (!run) {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }

    return NextResponse.json({
      runId: run.id,
      status: run.status,
      statusMessage: run.statusMessage,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      defaultDatasetId: run.defaultDatasetId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch the Apify run status.",
      },
      { status: 500 }
    );
  }
}
