import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const ACTORS = {
  adp: "fantastic-jobs~adp-jobs-api",
  ashby: "fantastic-jobs~ashby-jobs-api",
  careersitejoblistingfeed: "fantastic-jobs~career-site-job-listing-feed",
  careersitepremium: "fantastic-jobs~career-site-job-listing-api",
  greenhouse: "fantastic-jobs~greenhouse-jobs-api",
  icims: "fantastic-jobs~icims-jobs-api",
  lever: "fantastic-jobs~lever-co-jobs-api",
  linkedin: "fantastic-jobs~advanced-linkedin-job-search-api",
  mercor: "fantastic-jobs~mercor-job-search-api",
  paradox: "fantastic-jobs~paradox-ai-jobs-api",
  workday: "fantastic-jobs~workday-jobs-api",
};

export async function POST(req) {
  try {
    const { scraper, input } = await req.json();

    const scraperKey = scraper?.toLowerCase();

    if (!scraperKey || !ACTORS[scraperKey]) {
      return NextResponse.json(
        { error: 'Invalid scraper key: ${scraper}' },
        { status: 400 }
      );
    }

    console.log("▶ Running actor:", ACTORS[scraperKey]);
    console.log("▶ Input:", input);

    const run = await client.actor(ACTORS[scraperKey]).call(input, {
      waitSecs: 120,
    });

    if (!run?.defaultDatasetId) {
      return NextResponse.json(
        { error: "Actor run failed (no dataset returned)" },
        { status: 500 }
      );
    }

    const { items } = await client
      .dataset(run.defaultDatasetId)
      .listItems({ limit: 200 });

    console.log("Returned jobs:", items?.length || 0);

    return NextResponse.json({
      success: true,
      count: items?.length || 0,
      items: items || [],
    });

  } catch (err) {
    console.error("🔥 API ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}