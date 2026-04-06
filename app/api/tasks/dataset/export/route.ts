import { DownloadItemsFormat, ApifyClient } from "apify-client";
import { NextResponse } from "next/server";

function parseList(value: string | null) {
  if (!value) {
    return undefined;
  }

  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function getContentType(format: DownloadItemsFormat) {
  switch (format) {
    case DownloadItemsFormat.JSON:
      return "application/json; charset=utf-8";
    case DownloadItemsFormat.JSONL:
      return "application/x-ndjson; charset=utf-8";
    case DownloadItemsFormat.CSV:
      return "text/csv; charset=utf-8";
    case DownloadItemsFormat.XML:
      return "application/xml; charset=utf-8";
    case DownloadItemsFormat.HTML:
      return "text/html; charset=utf-8";
    case DownloadItemsFormat.RSS:
      return "application/rss+xml; charset=utf-8";
    case DownloadItemsFormat.XLSX:
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}

function getFileExtension(format: DownloadItemsFormat) {
  return format === DownloadItemsFormat.XLSX ? "xlsx" : format;
}

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
    const mode = searchParams.get("mode") || "download";
    const formatQuery = searchParams.get("format") || "json";
    const format = formatQuery as DownloadItemsFormat;

    if (!datasetId) {
      return NextResponse.json(
        { error: "A valid datasetId is required." },
        { status: 400 }
      );
    }

    const supportedFormats = Object.values(DownloadItemsFormat);

    if (!supportedFormats.includes(format)) {
      return NextResponse.json(
        { error: "Unsupported export format." },
        { status: 400 }
      );
    }

    if (mode === "preview" && format === DownloadItemsFormat.XLSX) {
      return NextResponse.json(
        { error: "Preview is not supported for Excel exports." },
        { status: 400 }
      );
    }

    const client = new ApifyClient({ token });
    const buffer = await client.dataset(datasetId).downloadItems(format, {
      attachment: mode === "download",
      bom: format === DownloadItemsFormat.CSV,
      clean: searchParams.get("clean") === "true",
      skipEmpty: searchParams.get("skipEmpty") === "true",
      skipHidden: searchParams.get("skipHidden") === "true",
      fields: parseList(searchParams.get("fields")),
      omit: parseList(searchParams.get("omit")),
    });

    if (mode === "preview") {
      return NextResponse.json({
        content: buffer.toString("utf-8"),
      });
    }

    const fileName = `apify-dataset-${datasetId}.${getFileExtension(format)}`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": getContentType(format),
        "Content-Disposition":
          mode === "download"
            ? `attachment; filename="${fileName}"`
            : `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to export the dataset.",
      },
      { status: 500 }
    );
  }
}
