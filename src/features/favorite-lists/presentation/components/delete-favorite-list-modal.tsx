"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TrashIcon } from "@/shared/ui/icons";
import {
  deleteFavoriteList,
  type FavoriteListResponse,
} from "@/features/favorite-lists/presentation/api/favorite-list-client";
import { FAVORITE_LISTS_QUERY_KEY } from "@/features/favorite-lists/presentation/hooks/use-favorite-lists";
import { ApiError } from "@/shared/lib/api-error";
import { removeById } from "@/shared/lib/query-cache";

/** Confirms deleting a favorite list. */
export function DeleteFavoriteListModal({
  list,
  onClose,
}: {
  list: FavoriteListResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteFavoriteList(list.id);
      queryClient.setQueryData<FavoriteListResponse[]>(FAVORITE_LISTS_QUERY_KEY, (old) =>
        removeById(old, list.id),
      );
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la lista. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Eliminar lista"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        ¿Seguro que quieres eliminar <strong>{list.nombre}</strong>?
      </p>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={handleConfirm}>
          Eliminar
        </Button>
      </div>
    </Modal>
  );
}
