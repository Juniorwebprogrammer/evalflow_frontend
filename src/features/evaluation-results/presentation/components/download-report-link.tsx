"use client";

import { useState } from "react";
import { DownloadIcon } from "@/shared/ui/icons";
import { Spinner } from "@/shared/ui/spinner";
import { parseMessage } from "@/shared/lib/api-error";
import { evaluationResultPdfUrl } from "@/features/evaluation-results/presentation/api/evaluation-result-client";

/** Reads the filename out of a `Content-Disposition` header, if present. */
function filenameFrom(header: string | null, fallback: string): string {
  const match = header?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : fallback;
}

/**
 * Downloads the PDF report. Fetched (instead of a plain `<a download>`) so
 * the button can show progress while the backend generates the file, and
 * surface an error if it fails.
 */
export function DownloadReportLink({ resultId, label = "Descargar informe" }: { resultId: number; label?: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(evaluationResultPdfUrl(resultId));
      if (!res.ok) throw new Error(await parseMessage(res));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFrom(
        res.headers.get("Content-Disposition"),
        `informe-evaluacion-${resultId}.pdf`,
      );
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo descargar el informe.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        aria-busy={downloading || undefined}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10 disabled:cursor-wait disabled:opacity-70"
      >
        {downloading ? <Spinner className="h-3.5 w-3.5" /> : <DownloadIcon className="h-3.5 w-3.5" />}
        {downloading ? "Generando…" : label}
      </button>
      {error && <span className="mt-0.5 text-xs text-red-600">{error}</span>}
    </span>
  );
}
