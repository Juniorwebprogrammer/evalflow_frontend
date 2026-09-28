import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { SubmissionFormView } from "@/features/evaluation-submissions/presentation/components/submission-form-view";

export default async function MiEvaluacionDetailPage({
  params,
}: PageProps<"/dashboard/mis-evaluaciones/[submissionId]">) {
  // Auth check (redirects to /login); memoized with the layout's call.
  await getCurrentProfile();

  const { submissionId } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <SubmissionFormView submissionId={Number(submissionId)} />
    </div>
  );
}
