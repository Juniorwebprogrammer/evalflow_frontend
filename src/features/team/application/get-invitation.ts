import type { Invitation } from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";

/** The invitation behind an email link (public), so the accept page can say who and where. */
export class GetInvitation {
  constructor(private readonly team: TeamRepository) {}

  execute(token: string): Promise<Invitation | null> {
    if (!token.trim()) return Promise.resolve(null);
    return this.team.getInvitation(token.trim());
  }
}
