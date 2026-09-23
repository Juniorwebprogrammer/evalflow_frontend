import { Notice } from "@/shared/ui/notice";
import { CheckCircleIcon } from "@/shared/ui/icons";

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
      <p className="font-semibold text-emerald-800">Se ha notificado a {email}</p>
      <p className="mt-0.5">
        Invitación enviada con el rol <strong>{rolAsignado}</strong>. El usuario
        recibirá un correo para unirse.
      </p>
    </Notice>
  );
}
