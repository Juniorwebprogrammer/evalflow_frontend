import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon } from "@/shared/ui/icons";
import { roleLabel } from "@/features/team/presentation/lib/format";

/** Success banner shown after an employee has been invited/notified. */
export function InviteSuccessNotice({
  email,
  rolAsignado,
}: {
  email: string;
  rolAsignado: string;
}) {
  return (
    <Notice
      tone="success"
      className="mt-5"
      icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
    >
      <p className="font-semibold text-emerald-800">{email} has been notified</p>
      <p className="mt-0.5">
        Invitation sent with the <strong>{roleLabel(rolAsignado)}</strong> role.
        They&apos;ll receive an email to join.
      </p>
    </Notice>
  );
}
