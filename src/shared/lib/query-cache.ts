/**
 * Small helpers for updating a React Query list cache optimistically after
 * a mutation, instead of blindly `invalidateQueries` + trusting the
 * server's refetch shape. Useful when a list-returning GET's exact DTO
 * field names are uncertain — writing back what we know we just persisted
 * is more reliable than a refetch that might silently reset a field the
 * mapping got wrong (e.g. an array field defaulting to `[]`).
 */

/** Replaces the item with the same `id`, or appends it if not present. */
export function upsertById<T extends { id: number }>(
  list: T[] | undefined,
  item: T,
): T[] {
  if (!list) return [item];
  const index = list.findIndex((x) => x.id === item.id);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = item;
  return next;
}

/** Removes the item with the given `id`, if present. */
export function removeById<T extends { id: number }>(
  list: T[] | undefined,
  id: number,
): T[] | undefined {
  if (!list) return list;
  return list.filter((x) => x.id !== id);
}

/** Toggles `id` in `ids`: removes it if present, appends it otherwise. */
export function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}
