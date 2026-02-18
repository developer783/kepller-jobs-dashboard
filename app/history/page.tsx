"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const [runs, setRuns] = useState<any[]>([]);

  useEffect(() => {
    fetchRuns();
  }, []);

  async function fetchRuns() {
    const { data } = await supabase
      .from("runs")
      .select("*")
      .order("created_at", { ascending: false });

    setRuns(data || []);
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Run History</h1>
      <p>Here you’ll see all previous runs per user.</p>

      {runs.map(run => (
        <div key={run.id} className="mb-4 p-4 bg-gray-900 rounded-xl">
          <p><b>Scraper:</b> {run.scraper}</p>
          <p><b>Results:</b> {run.result_count}</p>
          <p><b>Date:</b> {new Date(run.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
