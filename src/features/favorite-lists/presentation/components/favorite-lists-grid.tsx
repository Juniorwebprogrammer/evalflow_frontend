"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavoriteLists } from "@/features/favorite-lists/presentation/hooks/use-favorite-lists";
import type { FavoriteListResponse } from "@/features/favorite-lists/presentation/api/favorite-list-client";
import { FavoriteListFormModal } from "@/features/favorite-lists/presentation/components/favorite-list-form-modal";
import { DeleteFavoriteListModal } from "@/features/favorite-lists/presentation/components/delete-favorite-list-modal";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import { DropdownMenu } from "@/shared/ui/dropdown-menu";
import {
  AlertTriangleIcon,
  DocIcon,
  EditIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

type Action = { type: "create" } | { type: "edit"; list: FavoriteListResponse } | { type: "delete"; list: FavoriteListResponse } | null;

/**
 * The caller's own favorite lists (backend `GET /favorite-lists`) as a card
 * grid — tap a card to open its detail view (the templates it contains).
 */
export function FavoriteListsGrid() {
  const { data: lists, isLoading, error } = useFavoriteLists();
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);
  const [action, setAction] = useState<Action>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando listas…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de listas favoritas."}
      </Notice>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setAction({ type: "create" })}>
          <PlusIcon className="h-4 w-4" />
          Nueva lista
        </Button>
      </div>

      {(!lists || lists.length === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <StarIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Todavía no has creado ninguna lista favorita.</span>
        </div>
      )}

      {lists && lists.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="h-1.5 w-full bg-[var(--brand)]" />
              <div className="absolute right-3 top-4">
                <DropdownMenu
                  open={openMenuFor === list.id}
                  onOpenChange={(isOpen) => setOpenMenuFor(isOpen ? list.id : null)}
                  menuClassName="w-44"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAction({ type: "edit", list });
                      setOpenMenuFor(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <EditIcon className="h-4 w-4 text-slate-400" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAction({ type: "delete", list });
                      setOpenMenuFor(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar
                  </button>
                </DropdownMenu>
              </div>

              <Link
                href={`/dashboard/listas-favoritas/${list.id}`}
                className="flex flex-1 flex-col gap-3 p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
                  <StarIcon className="h-5 w-5" />
                </span>
                <div className="pr-8">
                  <p className="text-base font-bold text-slate-900">{list.nombre}</p>
                  {list.descripcion && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                      {list.descripcion}
                    </p>
                  )}
                </div>
                <p className="mt-auto flex items-center gap-1.5 text-sm text-slate-500">
                  <DocIcon className="h-4 w-4 text-slate-400" />
                  {list.templateIds.length}{" "}
                  {list.templateIds.length === 1 ? "plantilla" : "plantillas"}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      {action?.type === "create" && (
        <FavoriteListFormModal onClose={() => setAction(null)} />
      )}
      {action?.type === "edit" && (
        <FavoriteListFormModal list={action.list} onClose={() => setAction(null)} />
      )}
      {action?.type === "delete" && (
        <DeleteFavoriteListModal list={action.list} onClose={() => setAction(null)} />
      )}
    </div>
  );
}
