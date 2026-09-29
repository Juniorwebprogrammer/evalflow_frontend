"use client";

import { Modal } from "@/shared/ui/modal";
import { StarIcon } from "@/shared/ui/icons";
import { FavoriteListForm } from "@/features/favorite-lists/presentation/components/favorite-list-form";
import type { FavoriteListResponse } from "@/features/favorite-lists/presentation/api/favorite-list-client";

/** Modal wrapper around {@link FavoriteListForm}. Edits when `list` is given, creates otherwise. */
export function FavoriteListFormModal({
  list,
  onClose,
}: {
  list?: FavoriteListResponse;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={list ? "Edit list" : "New list"}
      description={
        list
          ? "Update the list's name or description."
          : "Create a list to organize your favorite templates."
      }
      icon={<StarIcon className="h-5 w-5" />}
    >
      <FavoriteListForm list={list} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
