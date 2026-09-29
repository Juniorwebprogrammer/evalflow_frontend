"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon, StarIcon } from "@/shared/ui/icons";
import {
  createFavoriteList,
  updateFavoriteList,
  type FavoriteListResponse,
} from "@/features/favorite-lists/presentation/api/favorite-list-client";
import { FAVORITE_LISTS_QUERY_KEY } from "@/features/favorite-lists/presentation/hooks/use-favorite-lists";
import { errorMessage } from "@/shared/lib/api-error";
import { upsertById } from "@/shared/lib/query-cache";

interface FormState {
  nombre: string;
  descripcion: string;
}

function toFormState(list?: FavoriteListResponse): FormState {
  return {
    nombre: list?.nombre ?? "",
    descripcion: list?.descripcion ?? "",
  };
}

/**
 * Favorite-list create/edit form, meant to be embedded inside a modal.
 * Edits when `list` is given, creates otherwise.
 */
export function FavoriteListForm({
  list,
  onSaved,
  onCancel,
}: {
  list?: FavoriteListResponse;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(list);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toFormState(list));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let savedList: FavoriteListResponse;
      if (isEditing && list) {
        await updateFavoriteList(list.id, form);
        // Preserve the list's known membership — editing name/description
        // must not reset which templates it contains.
        savedList = {
          id: list.id,
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          templateIds: list.templateIds,
        };
      } else {
        const result = await createFavoriteList(form);
        savedList = {
          id: result.favoriteListId,
          nombre: form.nombre,
          descripcion: form.descripcion || null,
          templateIds: [],
        };
      }
      setSaved(true);

      // Write the known-good result straight into the cache instead of only
      // invalidating — see the equivalent note in template-form.tsx.
      queryClient.setQueryData<FavoriteListResponse[]>(FAVORITE_LISTS_QUERY_KEY, (old) =>
        upsertById(old, savedList),
      );
    } catch (err) {
      setError(
        errorMessage(
          err,
          isEditing ? "We couldn't update the list." : "We couldn't create the list.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <>
        <Notice
          tone="success"
          icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        >
          List <strong>{form.nombre}</strong> {isEditing ? "updated" : "created"} successfully.
        </Notice>
        <Button type="button" className="mt-5 w-full" onClick={onSaved}>
          OK
        </Button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Name"
        icon={<StarIcon className="h-4 w-4" />}
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Templates for the sales team"
        required
        autoFocus
      />
      <Field
        label="Description"
        value={form.descripcion}
        onChange={(e) => update({ descripcion: e.target.value })}
        placeholder="Templates I use often"
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditing ? "Save changes" : "Create list"}
        </Button>
      </div>
    </form>
  );
}
