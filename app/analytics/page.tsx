"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    const { data } = await supabase
      .from("runs")
      .select("scraper");

    const counts: any = {};

    data?.forEach(run => {
      counts[run.scraper] = (counts[run.scraper] || 0) + 1;
    });

    const chartData = Object.entries(counts).map(([key, value]) => ({
      scraper: key,
      runs: value,
    }));

    setData(chartData);
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Usage Analytics</h1>
       <p>Charts and performance data will appear here.</p>

      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="scraper" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="runs" fill="#d4af37" />
      </BarChart>
    </div>
  );
}
