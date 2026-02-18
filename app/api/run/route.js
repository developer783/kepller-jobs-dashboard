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

    // ✅ Initialize INSIDE function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    const run = await client.actor(ACTORS[scraper]).call(input);

    return NextResponse.json({ success: true, run });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something failed" },
      { status: 500 }
    );
  }
}
