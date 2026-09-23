import "server-only";
import type {
  FavoriteList,
  FavoriteListInput,
  CreateFavoriteListResult,
  FavoriteListActionResult,
} from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend favorite-list-creation response (PascalCase, tolerant to variations). */
interface CreateFavoriteListDto {
  Message?: string;
  message?: string;
  FavoriteListId?: number;
  favoriteListId?: number;
  Id?: number;
  id?: number;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend favorite-list DTO (PascalCase, tolerant to variations). The
 * exact shape wasn't published — this accepts every plausible alias,
 * including for the member-template-id list.
 */
interface FavoriteListDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  TemplateIds?: number[];
  templateIds?: number[];
  Templates?: Array<{ Id?: number; id?: number }>;
  templates?: Array<{ Id?: number; id?: number }>;
}

function mapFavoriteList(dto: FavoriteListDto): FavoriteList {
  const templateIds =
    dto.TemplateIds ??
    dto.templateIds ??
    (dto.Templates ?? dto.templates ?? [])
      .map((t) => t.Id ?? t.id ?? 0)
      .filter(Boolean);

  return {
    id: dto.Id ?? dto.id ?? 0,
    nombre: dto.Nombre ?? dto.nombre ?? "",
    descripcion: dto.Descripcion ?? dto.descripcion ?? null,
    templateIds,
  };
}

export class HttpFavoriteListRepository implements FavoriteListRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<CreateFavoriteListResult> {
    const dto = await this.client.request<CreateFavoriteListDto>(
      "/favorite-lists",
      {
        method: "POST",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
        },
      },
    );

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta al crear la lista",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Lista creada con éxito.",
      favoriteListId:
        dto.FavoriteListId ?? dto.favoriteListId ?? dto.Id ?? dto.id ?? 0,
    };
  }

  async update(
    id: number,
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<FavoriteListActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/favorite-lists/${id}`,
      {
        method: "PUT",
        accessToken,
        body: {
          Nombre: input.Nombre,
          Descripcion: input.Descripcion ?? null,
        },
      },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Lista actualizada correctamente.",
    };
  }

  async remove(id: number, accessToken: string): Promise<FavoriteListActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/favorite-lists/${id}`,
      { method: "DELETE", accessToken },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Lista eliminada correctamente.",
    };
  }

  async listMine(accessToken: string): Promise<FavoriteList[]> {
    const dto = await this.client.request<FavoriteListDto[]>(
      "/favorite-lists",
      { accessToken },
    );

    return (dto ?? []).map(mapFavoriteList);
  }

  async toggleTemplate(
    listId: number,
    templateId: number,
    accessToken: string,
  ): Promise<FavoriteListActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/favorite-lists/${listId}/templates/${templateId}/toggle`,
      { method: "PUT", accessToken },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Lista actualizada correctamente.",
    };
  }
}
