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
import { errorMessage } from "@/shared/lib/api-error";
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
      setError(errorMessage(err, "We couldn't delete the list."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Delete list"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <strong>{list.nombre}</strong>?
      </p>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={handleConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
