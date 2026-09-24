import { DownloadIcon } from "@/shared/ui/icons";
import { evaluationResultPdfUrl } from "@/features/evaluation-results/presentation/api/evaluation-result-client";

export function DownloadReportLink({ resultId, label = "Descargar informe" }: { resultId: number; label?: string }) {
  return (
    <a
      href={evaluationResultPdfUrl(resultId)}
      download
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
    >
      <DownloadIcon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
