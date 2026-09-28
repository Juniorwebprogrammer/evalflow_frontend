/** Fallback shown in the main area while a dashboard screen loads. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-7" aria-busy="true" aria-label="Cargando">
      <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200/70" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
    </div>
  );
}
