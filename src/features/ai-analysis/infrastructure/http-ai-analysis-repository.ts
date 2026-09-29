import "server-only";
import type {
  AiAnalysis,
  AiAnalysisResult,
  AiAnalysisStatus,
  AiConfidence,
  AiRecipient,
  AiRiskLevel,
  RequestAiAnalysisInput,
  RequestAiAnalysisResult,
} from "@/features/ai-analysis/domain/ai-analysis";
import type { AiAnalysisRepository } from "@/features/ai-analysis/domain/ai-analysis-repository";
import { BackendClient } from "@/core/http/backend-client";

interface AiAnalysisResultDto {
  resumen?: string;
  nivelRiesgo?: AiRiskLevel;
  fortalezas?: string[];
  areasDeMejora?: string[];
  causasProbables?: Array<{
    tema?: string;
    preguntaIds?: number[];
    causa?: string;
    explicacion?: string;
    evidencia?: string[];
    confianza?: AiConfidence;
  }>;
  patrones?: string[];
  recomendaciones?: Array<{ destinatario?: AiRecipient; accion?: string }>;
  solicitudesSugeridas?: Array<{ preguntaId?: number | null; mensaje?: string }>;
  limitaciones?: string[];
}

interface AiAnalysisDto {
  id?: number;
  evaluationCycleId?: number;
  templateId?: number;
  evaluatedUserId?: number;
  estado?: AiAnalysisStatus;
  model?: string | null;
  fechaCreacion?: string;
  fechaCompletado?: string | null;
  errorMensaje?: string | null;
  result?: AiAnalysisResultDto | null;
}

interface RequestAiAnalysisResponseDto {
  created?: number;
  reused?: number;
  analyses?: AiAnalysisDto[];
}

function mapResult(dto: AiAnalysisResultDto): AiAnalysisResult {
  return {
    resumen: dto.resumen ?? "",
    nivelRiesgo: dto.nivelRiesgo ?? "Medio",
    fortalezas: dto.fortalezas ?? [],
    areasDeMejora: dto.areasDeMejora ?? [],
    causasProbables: (dto.causasProbables ?? []).map((c) => ({
      tema: c.tema ?? "General",
      preguntaIds: c.preguntaIds ?? [],
      causa: c.causa ?? "Otro",
      explicacion: c.explicacion ?? "",
      evidencia: c.evidencia ?? [],
      confianza: c.confianza ?? "Media",
    })),
    patrones: dto.patrones ?? [],
    recomendaciones: (dto.recomendaciones ?? []).map((r) => ({
      destinatario: r.destinatario ?? "RRHH",
      accion: r.accion ?? "",
    })),
    solicitudesSugeridas: (dto.solicitudesSugeridas ?? []).map((s) => ({
      preguntaId: s.preguntaId ?? null,
      mensaje: s.mensaje ?? "",
    })),
    limitaciones: dto.limitaciones ?? [],
  };
}

function mapAnalysis(dto: AiAnalysisDto): AiAnalysis {
  return {
    id: dto.id ?? 0,
    evaluationCycleId: dto.evaluationCycleId ?? 0,
    templateId: dto.templateId ?? 0,
    evaluatedUserId: dto.evaluatedUserId ?? 0,
    estado: dto.estado ?? "Pendiente",
    model: dto.model ?? null,
    fechaCreacion: dto.fechaCreacion ?? "",
    fechaCompletado: dto.fechaCompletado ?? null,
    errorMensaje: dto.errorMensaje ?? null,
    result: dto.result ? mapResult(dto.result) : null,
  };
}

export class HttpAiAnalysisRepository implements AiAnalysisRepository {
  constructor(private readonly client: BackendClient) {}

  async getByCycle(cycleId: number, evaluatedUserId: number | null, accessToken: string): Promise<AiAnalysis[]> {
    const query = evaluatedUserId ? `?evaluatedUserId=${evaluatedUserId}` : "";
    const dto = await this.client.request<AiAnalysisDto[]>(`/evaluation-cycles/${cycleId}/ai-analysis${query}`, {
      accessToken,
    });
    return (dto ?? []).map(mapAnalysis);
  }

  async request(
    cycleId: number,
    input: RequestAiAnalysisInput,
    accessToken: string,
  ): Promise<RequestAiAnalysisResult> {
    const dto = await this.client.request<RequestAiAnalysisResponseDto>(`/evaluation-cycles/${cycleId}/ai-analysis`, {
      method: "POST",
      body: {
        evaluatedUserId: input.evaluatedUserId ?? null,
        templateId: input.templateId ?? null,
        force: input.force ?? false,
      },
      accessToken,
    });
    return {
      created: dto?.created ?? 0,
      reused: dto?.reused ?? 0,
      analyses: (dto?.analyses ?? []).map(mapAnalysis),
    };
  }
}
