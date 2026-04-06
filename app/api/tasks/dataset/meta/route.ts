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
    const datasetId = searchParams.get("datasetId")?.trim() || "";

    if (!datasetId) {
      return NextResponse.json(
        { error: "A valid datasetId is required." },
        { status: 400 }
      );
    }

    const client = new ApifyClient({ token });
    const datasetClient = client.dataset(datasetId);
    const dataset = await datasetClient.get();

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
    }

    let fields = dataset.fields || [];

    if (fields.length === 0) {
      const { items } = await datasetClient.listItems({ limit: 1 });
      fields = items[0] ? Object.keys(items[0]) : [];
    }

    return NextResponse.json({
      datasetId: dataset.id,
      itemCount: dataset.itemCount,
      fields,
      title: dataset.title,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dataset metadata.",
      },
      { status: 500 }
    );
  }
}
