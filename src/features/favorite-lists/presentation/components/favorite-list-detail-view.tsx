"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFavoriteLists,
  FAVORITE_LISTS_QUERY_KEY,
} from "@/features/favorite-lists/presentation/hooks/use-favorite-lists";
import {
  toggleTemplateInList,
  type FavoriteListResponse,
} from "@/features/favorite-lists/presentation/api/favorite-list-client";
import { useTemplates } from "@/features/templates/presentation/hooks/use-templates";
import { FavoriteListFormModal } from "@/features/favorite-lists/presentation/components/favorite-list-form-modal";
import { DeleteFavoriteListModal } from "@/features/favorite-lists/presentation/components/delete-favorite-list-modal";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  DocIcon,
  EditIcon,
  StarIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";
import { toggleId } from "@/shared/lib/query-cache";

/**
 * Favorite-list detail: its own fields plus every template in the caller's
 * company, checked when it belongs to this list (backend `PUT
 * /favorite-lists/{listId}/templates/{templateId}/toggle`). There's no
 * "list details" endpoint — the list itself (with its `templateIds`) comes
 * from the same `GET /favorite-lists` the grid page uses.
 */
export function FavoriteListDetailView({ listId }: { listId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: lists, isLoading: loadingLists, error: listsError } = useFavoriteLists();
  const { data: templates, isLoading: loadingTemplates, error: templatesError } = useTemplates();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const list = lists?.find((l) => l.id === listId);

  async function handleToggle(templateId: number) {
    setPendingId(templateId);
    setToggleError(null);
    try {
      await toggleTemplateInList(listId, templateId);
      queryClient.setQueryData<FavoriteListResponse[]>(FAVORITE_LISTS_QUERY_KEY, (old) =>
        old?.map((l) =>
          l.id === listId ? { ...l, templateIds: toggleId(l.templateIds, templateId) } : l,
        ),
      );
    } catch (err) {
      setToggleError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar la lista. Inténtalo de nuevo.",
      );
    } finally {
      setPendingId(null);
    }
  }

  if (loadingLists) {
    return <p className="text-sm text-slate-500">Cargando lista…</p>;
  }

  if (listsError || !list) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {listsError instanceof ApiError ? listsError.message : "No se pudo cargar la lista."}
      </Notice>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/listas-favoritas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver a listas favoritas
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <StarIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{list.nombre}</h1>
              {list.descripcion && (
                <p className="mt-1 text-sm text-slate-500">{list.descripcion}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              <EditIcon className="h-4 w-4" />
              Editar
            </Button>
            <button
              type="button"
              title="Eliminar lista"
              onClick={() => setDeleting(true)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Plantillas ({list.templateIds.length})
        </h2>

        {loadingTemplates && <p className="text-sm text-slate-500">Cargando plantillas…</p>}

        {templatesError && (
          <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
            {templatesError instanceof ApiError
              ? templatesError.message
              : "No se pudo cargar el listado de plantillas."}
          </Notice>
        )}

        {templates && templates.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
            <DocIcon className="h-5 w-5 shrink-0 text-slate-400" />
            <span>Todavía no hay ninguna plantilla creada.</span>
          </div>
        )}

        {templates && templates.length > 0 && (
          <ul className="space-y-2">
            {templates.map((template) => {
              const checked = list.templateIds.includes(template.id);
              const pending = pendingId === template.id;
              return (
                <li
                  key={template.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={pending}
                    onChange={() => handleToggle(template.id)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30 disabled:opacity-50"
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                    <DocIcon className="h-4 w-4" />
                  </span>
                  <Link
                    href={`/dashboard/plantillas/${template.id}`}
                    className="min-w-0 flex-1 hover:underline"
                  >
                    <p className="truncate font-medium text-slate-900">{template.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(template.fechaInicio)} → {formatDate(template.fechaFin)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {toggleError && <Notice tone="error">{toggleError}</Notice>}
      </div>

      {editing && <FavoriteListFormModal list={list} onClose={() => setEditing(false)} />}
      {deleting && (
        <DeleteFavoriteListModal
          list={list}
          onClose={() => {
            setDeleting(false);
            // DeleteFavoriteListModal calls this both on cancel and after a
            // successful delete — only navigate away in the latter case
            // (the list is gone from the cache by then).
            const stillExists = queryClient
              .getQueryData<FavoriteListResponse[]>(FAVORITE_LISTS_QUERY_KEY)
              ?.some((l) => l.id === listId);
            if (!stillExists) {
              router.push("/dashboard/listas-favoritas");
            }
          }}
        />
      )}
    </div>
  );
}
