import { AcceptInviteView } from "@/features/team/presentation/components/accept-invite-view";

/**
 * Landing page for the invitation email link, e.g.
 *   /accept-invite?token=xxxxx
 *
 * The path mirrors the invite link built by `InviteEmployeeHandler`
 * (`{frontendUrl}/accept-invite?token=...`). Reads the token from the URL and
 * hands it to AcceptInviteView, which completes the invitation.
 */
export default async function AcceptInvitePage({
  searchParams,
}: PageProps<"/accept-invite">) {
  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  return <AcceptInviteView token={token} />;
}
