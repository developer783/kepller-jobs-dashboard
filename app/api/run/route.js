import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { scraper, input } = await req.json();

    const ACTORS = {
      adp: "fantastic-jobs~adp-jobs-api",
      ashby: "fantastic-jobs~ashby-jobs-api",
      greenhouse: "fantastic-jobs~greenhouse-jobs-api",
      linkedin: "fantastic-jobs~advanced-linkedin-job-search-api",
    };

    if (!scraper || !ACTORS[scraper]) {
      return NextResponse.json(
        { error: "Invalid scraper key" },
        { status: 400 }
      );
    }

    console.log("▶ Running actor:", ACTORS[scraper]);
    console.log("▶ Input:", input);

    const datasetId = run.defaultDatasetId;

    if (!run?.defaultDatasetId) {
      return NextResponse.json(
        { error: "Actor run failed (no dataset)" },
        { status: 500 }
      );
    }

    const { items } = await client
      .dataset(run.defaultDatasetId)
      .listItems({ clean: true });

    return NextResponse.json(items);

  } catch (err) {
    console.error("🔥 API ERROR:", err);

    return NextResponse.json(
      { error: "Something failed" },
      { status: 500 }
    );
  }
}
