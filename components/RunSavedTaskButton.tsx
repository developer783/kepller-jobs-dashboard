"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SavedTaskExportModal from "@/components/SavedTaskExportModal";

type RunSavedTaskButtonProps = {
  taskId: string;
};

type RunStatusResponse = {
  runId: string;
  status: string;
  statusMessage?: string;
  defaultDatasetId?: string;
};

export default function RunSavedTaskButton({
  taskId,
}: RunSavedTaskButtonProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<RunStatusResponse | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const isTerminal =
    run?.status === "SUCCEEDED" ||
    run?.status === "FAILED" ||
    run?.status === "ABORTED" ||
    run?.status === "TIMED-OUT";

  const statusTone = useMemo(() => {
    if (!run) {
      return "text-yellow-100/80";
    }

    if (run.status === "SUCCEEDED") {
      return "text-emerald-300";
    }

    if (run.status === "FAILED" || run.status === "ABORTED" || run.status === "TIMED-OUT") {
      return "text-red-300";
    }

    return "text-amber-300";
  }, [run]);

  useEffect(() => {
    const runId = run?.runId;

    if (!runId || isTerminal) {
      return;
    }

    const activeRunId: string = runId;

    let cancelled = false;

    async function fetchRunStatus() {
      try {
        const response = await fetch(
          `/api/tasks/run-status?runId=${encodeURIComponent(activeRunId)}`
        );
        const data = (await response.json()) as RunStatusResponse & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch run status.");
        }

        if (cancelled) {
          return;
        }

        setRun((current) => ({
          runId: data.runId || current?.runId || "",
          status: data.status || current?.status || "RUNNING",
          statusMessage: data.statusMessage || current?.statusMessage,
          defaultDatasetId: data.defaultDatasetId || current?.defaultDatasetId,
        }));

        if (
          data.status === "SUCCEEDED" ||
          data.status === "FAILED" ||
          data.status === "ABORTED" ||
          data.status === "TIMED-OUT"
        ) {
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (statusError) {
        if (!cancelled) {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "Failed to fetch the task run status."
          );
        }
      }
    }

    fetchRunStatus();
    const interval = window.setInterval(fetchRunStatus, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isTerminal, router, run?.runId]);

  async function handleRunTask() {
    setIsStarting(true);
    setError(null);
    setRun(null);

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
        defaultDatasetId?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to start the saved task.");
      }

      setRun({
        runId: data.runId || "Unknown",
        status: data.status || "RUNNING",
        defaultDatasetId: data.defaultDatasetId,
      });
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Failed to start the saved task."
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <div className="flex flex-wrap gap-3 md:justify-end">
          <button
            type="button"
            onClick={handleRunTask}
            disabled={isStarting || (run !== null && !isTerminal)}
            className="rounded-full border border-yellow-400/40 bg-yellow-400 px-5 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStarting
              ? "Starting..."
              : run && !isTerminal
                ? "Running..."
                : run?.status === "SUCCEEDED"
                  ? "Run Again"
                  : "Run Task"}
          </button>

          {run?.status === "SUCCEEDED" && run.defaultDatasetId ? (
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Export
            </button>
          ) : null}
        </div>

        {run ? (
          <div className={`max-w-xs text-xs leading-6 md:text-right ${statusTone}`}>
            <p>
              Status: <span className="font-semibold">{run.status}</span>
            </p>
            <p>
              Run ID: <span className="font-semibold">{run.runId}</span>
            </p>
            {run.statusMessage ? <p>{run.statusMessage}</p> : null}
            {run.status === "SUCCEEDED" ? (
              <p className="font-semibold text-emerald-300">Run successful.</p>
            ) : null}
          </div>
        ) : null}

        {run?.status === "FAILED" || run?.status === "ABORTED" || run?.status === "TIMED-OUT" ? (
          <p className="max-w-xs text-xs leading-6 text-red-300 md:text-right">
            The task finished with status <span className="font-semibold">{run.status}</span>.
          </p>
        ) : null}

        {run?.status === "RUNNING" || run?.status === "READY" ? (
          <p className="max-w-xs text-xs leading-6 text-amber-300 md:text-right">
            The task is still running. This card will keep checking Apify until the run
            finishes.
          </p>
        ) : null}

        {error ? (
          <p className="max-w-xs text-xs leading-6 text-red-300 md:text-right">{error}</p>
        ) : null}
      </div>

      {run?.status === "SUCCEEDED" && run.defaultDatasetId ? (
        <SavedTaskExportModal
          datasetId={run.defaultDatasetId}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      ) : null}
    </>
  );
}
