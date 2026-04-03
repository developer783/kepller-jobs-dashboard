import { ApifyClient, type Task } from "apify-client";
import GoldBackground from "@/components/GoldBackground";
import RunSavedTaskButton from "@/components/RunSavedTaskButton";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatJson(value: unknown) {
  if (value === undefined) {
    return "No saved input found.";
  }

  return JSON.stringify(value, null, 2);
}

async function getSavedTasks(): Promise<{ tasks: Task[]; error?: string }> {
  const token = process.env.APIFY_TOKEN;

  if (!token) {
    return { tasks: [], error: "APIFY_TOKEN is not configured on the server." };
  }

  try {
    const client = new ApifyClient({ token });
    const taskIds: string[] = [];

    for await (const task of client.tasks().list({ desc: true })) {
      taskIds.push(task.id);
    }

    const tasks = await Promise.all(taskIds.map(async (id) => client.task(id).get()));

    return {
      tasks: tasks.filter((task): task is Task => task !== undefined),
    };
  } catch (error) {
    return {
      tasks: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to load saved tasks from Apify.",
    };
  }
}

export default async function SavedTasksPage() {
  const { tasks, error } = await getSavedTasks();

  return (
    <div className="relative min-h-screen bg-black py-12 pl-28 pr-8 text-white md:pr-12">
      <GoldBackground />
      <Sidebar />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-500/70">
            Apify Integration
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-yellow-400 md:text-5xl">
            Saved Tasks
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-yellow-100/70 md:text-base">
            This page reads live from your Apify saved tasks.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {!error && tasks.length === 0 ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-6 text-yellow-100/80">
            No saved tasks were returned by Apify for the configured account.
          </div>
        ) : null}

        <div className="space-y-6">
          {tasks.map((task) => (
            <section
              key={task.id}
              className="rounded-3xl border border-yellow-500/20 bg-white/5 p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-yellow-500/60">
                    {task.username ? `${task.username} / ${task.name}` : task.name}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-yellow-300">
                    {task.title || task.name}
                  </h2>
                  {task.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-yellow-50/75">
                      {task.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 md:items-end">
                  <div className="grid gap-2 text-sm text-yellow-100/80 md:text-right">
                    <span>Runs: {task.stats?.totalRuns ?? 0}</span>
                    <span>Created: {formatDate(task.createdAt)}</span>
                    <span>Updated: {formatDate(task.modifiedAt)}</span>
                  </div>

                  <RunSavedTaskButton taskId={task.id} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/60">
                    Task Id
                  </p>
                  <p className="mt-2 break-all text-sm text-yellow-50/85">{task.id}</p>
                </div>

                <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/60">
                    Actor Id
                  </p>
                  <p className="mt-2 break-all text-sm text-yellow-50/85">{task.actId}</p>
                </div>

                <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/60">
                    Build
                  </p>
                  <p className="mt-2 text-sm text-yellow-50/85">
                    {task.options?.build || "Default"}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-500/60">
                    Runtime Options
                  </p>
                  <p className="mt-2 text-sm text-yellow-50/85">
                    Memory: {task.options?.memoryMbytes ?? "Default"} MB
                  </p>
                  <p className="mt-1 text-sm text-yellow-50/85">
                    Timeout: {task.options?.timeoutSecs ?? "Default"} sec
                  </p>
                  <p className="mt-1 text-sm text-yellow-50/85">
                    Restart on error: {task.options?.restartOnError ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <details className="mt-6 rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                <summary className="cursor-pointer text-sm font-medium text-yellow-300">
                  View saved Apify input
                </summary>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-yellow-50/80">
                  {formatJson(task.input)}
                </pre>
              </details>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
