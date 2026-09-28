import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { MyEvaluationResultsView } from "@/features/evaluation-results/presentation/components/my-evaluation-results-view";

export default async function ResultadosEvaluacionPage() {
  // Auth check (redirects to /login); memoized with the layout's call.
  await getCurrentProfile();

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Resultados de evaluación</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tus evaluaciones completadas y sus informes en PDF
        </p>
      </header>
      <div className="mt-6">
        <MyEvaluationResultsView />
      </div>
    </div>
  );
}
