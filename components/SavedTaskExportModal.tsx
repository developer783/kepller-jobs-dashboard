"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type SavedTaskExportModalProps = {
  datasetId: string;
  isOpen: boolean;
  onClose: () => void;
};

type ExportFormat = "json" | "csv" | "xml" | "xlsx" | "html" | "rss" | "jsonl";
type ExportView = "overview" | "all";

type DatasetMeta = {
  datasetId: string;
  itemCount: number;
  fields: string[];
  title?: string;
};

const exportFormats: Array<{ label: string; value: ExportFormat }> = [
  { label: "JSON", value: "json" },
  { label: "CSV", value: "csv" },
  { label: "XML", value: "xml" },
  { label: "Excel", value: "xlsx" },
  { label: "HTML Table", value: "html" },
  { label: "RSS", value: "rss" },
  { label: "JSONL", value: "jsonl" },
];

function buildFieldPreset(fields: string[]) {
  return fields.slice(0, Math.min(fields.length, 8));
}

export default function SavedTaskExportModal({
  datasetId,
  isOpen,
  onClose,
}: SavedTaskExportModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [view, setView] = useState<ExportView>("overview");
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [omitFields, setOmitFields] = useState<string[]>([]);
  const [clean, setClean] = useState(false);
  const [skipEmpty, setSkipEmpty] = useState(false);
  const [skipHidden, setSkipHidden] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted || !isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMounted, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let ignore = false;

    async function fetchMeta() {
      setIsLoadingMeta(true);
      setMetaError(null);

      try {
        const response = await fetch(
          `/api/tasks/dataset/meta?datasetId=${encodeURIComponent(datasetId)}`
        );
        const data = (await response.json()) as DatasetMeta & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load dataset metadata.");
        }

        if (ignore) {
          return;
        }

        setMeta(data);
        setSelectedFields(buildFieldPreset(data.fields));
      } catch (error) {
        if (!ignore) {
          setMetaError(
            error instanceof Error
              ? error.message
              : "Failed to load dataset metadata."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingMeta(false);
        }
      }
    }

    fetchMeta();

    return () => {
      ignore = true;
    };
  }, [datasetId, isOpen]);

  useEffect(() => {
    if (!isOpen || !meta) {
      return;
    }

    if (view === "overview") {
      setSelectedFields(buildFieldPreset(meta.fields));
    } else {
      setSelectedFields([]);
    }

    setPreview("");
    setPreviewError(null);
  }, [isOpen, meta, view]);

  const exportQuery = useMemo(() => {
    const params = new URLSearchParams({
      datasetId,
      format,
    });

    if (selectedFields.length > 0) {
      params.set("fields", selectedFields.join(","));
    }

    if (omitFields.length > 0) {
      params.set("omit", omitFields.join(","));
    }

    if (clean) {
      params.set("clean", "true");
    }

    if (skipEmpty) {
      params.set("skipEmpty", "true");
    }

    if (skipHidden) {
      params.set("skipHidden", "true");
    }

    return params;
  }, [clean, datasetId, format, omitFields, selectedFields, skipEmpty, skipHidden]);

  async function handlePreview() {
    setIsPreviewLoading(true);
    setPreview("");
    setPreviewError(null);

    try {
      const params = new URLSearchParams(exportQuery);
      params.set("mode", "preview");

      const response = await fetch(`/api/tasks/dataset/export?${params.toString()}`);
      const data = (await response.json()) as { content?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to preview the export.");
      }

      setPreview(data.content || "");
    } catch (error) {
      setPreviewError(
        error instanceof Error ? error.message : "Failed to preview the export."
      );
    } finally {
      setIsPreviewLoading(false);
    }
  }

  async function handleCopyShareableLink() {
    const params = new URLSearchParams(exportQuery);
    params.set("mode", "view");

    const url = `${window.location.origin}/api/tasks/dataset/export?${params.toString()}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openInNewTab() {
    const params = new URLSearchParams(exportQuery);
    params.set("mode", "view");
    window.open(
      `/api/tasks/dataset/export?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function download() {
    const params = new URLSearchParams(exportQuery);
    params.set("mode", "download");
    window.location.href = `/api/tasks/dataset/export?${params.toString()}`;
  }

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/15 bg-[#f7f4ef] text-[#1b1b1b] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ded8ce] px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <h3 className="text-3xl font-semibold tracking-tight">Export dataset</h3>
            <span className="truncate rounded-md bg-[#ebe6dc] px-3 py-1 text-sm text-[#4c4a45]">
              {datasetId}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-2xl text-[#4c4a45] transition hover:bg-black/5"
            aria-label="Close export modal"
          >
            x
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <p className="mb-2 text-sm font-medium text-[#3b3a37]">View</p>
            <div className="inline-flex rounded-xl border border-[#d2cbc0] bg-white p-1">
              <button
                type="button"
                onClick={() => setView("overview")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  view === "overview" ? "bg-[#efebe3] shadow-sm" : "text-[#66625c]"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setView("all")}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  view === "all" ? "bg-[#efebe3] shadow-sm" : "text-[#66625c]"
                }`}
              >
                All fields
              </button>
            </div>
            <p className="mt-3 text-sm text-[#6d695f]">
              Some fields may be excluded in the export. To get everything, select All
              fields.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-[#3b3a37]">Format</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {exportFormats.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-lg">
                  <input
                    type="radio"
                    name={`export-format-${datasetId}`}
                    value={option.value}
                    checked={format === option.value}
                    onChange={() => setFormat(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#3b3a37]">
                Select fields <span className="text-[#6d695f]">(optional)</span>
              </label>
              <select
                multiple
                value={selectedFields}
                onChange={(event) =>
                  setSelectedFields(
                    Array.from(event.target.selectedOptions, (option) => option.value)
                  )
                }
                className="h-44 w-full rounded-xl border border-[#d2cbc0] bg-white px-4 py-3 text-sm outline-none"
              >
                {meta?.fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#6d695f]">
                Leave empty to include all available fields. Use Ctrl/Cmd-click to select
                multiple fields.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#3b3a37]">
                Omit fields <span className="text-[#6d695f]">(optional)</span>
              </label>
              <select
                multiple
                value={omitFields}
                onChange={(event) =>
                  setOmitFields(
                    Array.from(event.target.selectedOptions, (option) => option.value)
                  )
                }
                className="h-44 w-full rounded-xl border border-[#d2cbc0] bg-white px-4 py-3 text-sm outline-none"
              >
                {meta?.fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[#6d695f]">
                Use this when you want the full dataset except for a few columns.
              </p>
            </div>
          </div>

          <details className="rounded-2xl border border-[#d2cbc0] bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#3b3a37]">
              Advanced options
            </summary>
            <div className="mt-4 grid gap-3 text-sm text-[#3b3a37]">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={clean}
                  onChange={(event) => setClean(event.target.checked)}
                />
                <span>Clean output</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={skipEmpty}
                  onChange={(event) => setSkipEmpty(event.target.checked)}
                />
                <span>Skip empty rows</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={skipHidden}
                  onChange={(event) => setSkipHidden(event.target.checked)}
                />
                <span>Skip hidden fields</span>
              </label>
            </div>
          </details>

          {isLoadingMeta ? (
            <p className="text-sm text-[#6d695f]">Loading dataset metadata...</p>
          ) : null}

          {meta ? (
            <p className="text-sm text-[#6d695f]">
              Dataset has <span className="font-semibold">{meta.itemCount}</span> items and{" "}
              <span className="font-semibold">{meta.fields.length}</span> fields.
            </p>
          ) : null}

          {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}
          {previewError ? <p className="text-sm text-red-600">{previewError}</p> : null}
          {copied ? (
            <p className="text-sm font-medium text-emerald-600">
              Shareable export link copied.
            </p>
          ) : null}

          {preview ? (
            <div className="rounded-2xl border border-[#d2cbc0] bg-white">
              <div className="border-b border-[#ebe6dc] px-4 py-3 text-sm font-semibold text-[#3b3a37]">
                Preview
              </div>
              <pre className="max-h-72 overflow-auto px-4 py-4 text-xs leading-6 text-[#2d2b29]">
                {preview}
              </pre>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[#ded8ce] px-6 py-4">
          <button
            type="button"
            onClick={download}
            className="rounded-xl bg-[#1677ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0e67e0]"
          >
            Download
          </button>
          <button
            type="button"
            onClick={openInNewTab}
            className="rounded-xl border border-[#d2cbc0] bg-white px-5 py-3 text-sm font-semibold text-[#2d2b29] transition hover:bg-[#f5f1ea]"
          >
            View in new tab
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isPreviewLoading}
            className="rounded-xl border border-[#d2cbc0] bg-white px-5 py-3 text-sm font-semibold text-[#2d2b29] transition hover:bg-[#f5f1ea] disabled:opacity-60"
          >
            {isPreviewLoading ? "Loading preview..." : "Preview"}
          </button>
          <button
            type="button"
            onClick={handleCopyShareableLink}
            className="rounded-xl border border-[#d2cbc0] bg-white px-5 py-3 text-sm font-semibold text-[#2d2b29] transition hover:bg-[#f5f1ea]"
          >
            Copy shareable link
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
