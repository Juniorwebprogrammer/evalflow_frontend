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
      title={list ? "Editar lista" : "Nueva lista"}
      description={
        list
          ? "Actualiza el nombre o la descripción de la lista."
          : "Crea una lista para organizar tus plantillas favoritas."
      }
      icon={<StarIcon className="h-5 w-5" />}
    >
      <FavoriteListForm list={list} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
