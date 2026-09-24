import "server-only";
import type {
  Clarification,
  ClarificationParticipant,
  ClarificationStatus,
  CreateClarificationInput,
  MyClarification,
} from "@/features/clarifications/domain/clarification";
import type { ClarificationRepository } from "@/features/clarifications/domain/clarification-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

interface ClarificationDto {
  id?: number;
  cycleId?: number;
  templateId?: number;
  templateTitle?: string;
  questionId?: number | null;
  questionText?: string | null;
  evaluatedUserId?: number;
  evaluatedUserName?: string;
  managerUserId?: number;
  managerName?: string;
  requestedByName?: string;
  mensaje?: string;
  evaluatedResponse?: string | null;
  evaluatedRespondedAt?: string | null;
  managerResponse?: string | null;
  managerRespondedAt?: string | null;
  estado?: ClarificationStatus;
  fechaCreacion?: string;
}

interface MyClarificationDto {
  id?: number;
  cycleName?: string;
  templateTitle?: string;
  questionText?: string | null;
  evaluatedUserName?: string;
  myRole?: ClarificationParticipant;
  requestedByName?: string;
  mensaje?: string;
  myResponse?: string | null;
  myRespondedAt?: string | null;
  fechaCreacion?: string;
}

function mapClarification(dto: ClarificationDto): Clarification {
  return {
    id: dto.id ?? 0,
    cycleId: dto.cycleId ?? 0,
    templateId: dto.templateId ?? 0,
    templateTitle: dto.templateTitle ?? "",
    questionId: dto.questionId ?? null,
    questionText: dto.questionText ?? null,
    evaluatedUserId: dto.evaluatedUserId ?? 0,
    evaluatedUserName: dto.evaluatedUserName ?? "",
    managerUserId: dto.managerUserId ?? 0,
    managerName: dto.managerName ?? "",
    requestedByName: dto.requestedByName ?? "",
    mensaje: dto.mensaje ?? "",
    evaluatedResponse: dto.evaluatedResponse ?? null,
    evaluatedRespondedAt: dto.evaluatedRespondedAt ?? null,
    managerResponse: dto.managerResponse ?? null,
    managerRespondedAt: dto.managerRespondedAt ?? null,
    estado: dto.estado ?? "Pendiente",
    fechaCreacion: dto.fechaCreacion ?? "",
  };
}

function mapMyClarification(dto: MyClarificationDto): MyClarification {
  return {
    id: dto.id ?? 0,
    cycleName: dto.cycleName ?? "",
    templateTitle: dto.templateTitle ?? "",
    questionText: dto.questionText ?? null,
    evaluatedUserName: dto.evaluatedUserName ?? "",
    myRole: dto.myRole ?? "Evaluado",
    requestedByName: dto.requestedByName ?? "",
    mensaje: dto.mensaje ?? "",
    myResponse: dto.myResponse ?? null,
    myRespondedAt: dto.myRespondedAt ?? null,
    fechaCreacion: dto.fechaCreacion ?? "",
  };
}

export class HttpClarificationRepository implements ClarificationRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    cycleId: number,
    input: CreateClarificationInput,
    accessToken: string,
  ): Promise<Clarification> {
    const dto = await this.client.request<ClarificationDto>(
      `/evaluation-cycles/${cycleId}/clarifications`,
      { method: "POST", body: input, accessToken },
    );
    if (!dto) throw new UpstreamError("El servidor no devolvió la solicitud creada");
    return mapClarification(dto);
  }

  async getByCycle(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<Clarification[]> {
    const query = evaluatedUserId ? `?evaluatedUserId=${evaluatedUserId}` : "";
    const dto = await this.client.request<ClarificationDto[]>(
      `/evaluation-cycles/${cycleId}/clarifications${query}`,
      { accessToken },
    );
    return (dto ?? []).map(mapClarification);
  }

  async getMine(accessToken: string): Promise<MyClarification[]> {
    const dto = await this.client.request<MyClarificationDto[]>("/clarifications/mine", {
      accessToken,
    });
    return (dto ?? []).map(mapMyClarification);
  }

  async respond(
    clarificationId: number,
    respuesta: string,
    accessToken: string,
  ): Promise<MyClarification> {
    const dto = await this.client.request<MyClarificationDto>(
      `/clarifications/${clarificationId}/response`,
      { method: "PUT", body: { respuesta }, accessToken },
    );
    if (!dto) throw new UpstreamError("El servidor no devolvió la respuesta guardada");
    return mapMyClarification(dto);
  }
}
