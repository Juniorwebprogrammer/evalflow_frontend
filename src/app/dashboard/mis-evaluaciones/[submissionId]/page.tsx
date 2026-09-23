import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import { AppShell } from "@/shared/components/app-shell";
import { SubmissionFormView } from "@/features/evaluation-submissions/presentation/components/submission-form-view";

export default async function MiEvaluacionDetailPage({
  params,
}: PageProps<"/dashboard/mis-evaluaciones/[submissionId]">) {
  const session = await readSession();
  if (!session) redirect("/login");

  let profile;
  try {
    profile = await useCases.getMyProfile.execute(session.jwt);
  } catch {
    // Token invalid/expired or backend unreachable → back to login.
    redirect("/login");
  }

  const { submissionId } = await params;

  return (
    <AppShell initialProfile={profile}>
      <div className="mx-auto max-w-6xl px-8 py-7">
        <SubmissionFormView submissionId={Number(submissionId)} />
      </div>
    </AppShell>
  );
}
