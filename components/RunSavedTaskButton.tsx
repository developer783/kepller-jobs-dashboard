"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type RunSavedTaskButtonProps = {
  taskId: string;
};

type RunResult = {
  runId: string;
  status: string;
};

export default function RunSavedTaskButton({
  taskId,
}: RunSavedTaskButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  async function handleRunTask() {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tasks/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      const data = (await response.json()) as {
        error?: string;
        runId?: string;
        status?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to start the saved task.");
      }

      setResult({
        runId: data.runId || "Unknown",
        status: data.status || "RUNNING",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Failed to start the saved task."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 md:items-end">
      <button
        type="button"
        onClick={handleRunTask}
        disabled={isSubmitting}
        className="rounded-full border border-yellow-400/40 bg-yellow-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Starting..." : "Run Task"}
      </button>

      {result ? (
        <p className="max-w-xs text-xs leading-6 text-emerald-300 md:text-right">
          Started run <span className="font-semibold">{result.runId}</span> with status{" "}
          <span className="font-semibold">{result.status}</span>.
        </p>
      ) : null}

      {error ? (
        <p className="max-w-xs text-xs leading-6 text-red-300 md:text-right">{error}</p>
      ) : null}
    </div>
  );
}
