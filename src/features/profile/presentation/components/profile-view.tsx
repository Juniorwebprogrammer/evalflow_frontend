"use client";

import { useState } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { useProfile } from "@/features/profile/presentation/hooks/use-profile";
import { ProfileHeader } from "@/features/profile/presentation/components/profile-header";
import {
  ProfileNav,
  canOpenProfileTab,
  type ProfileTab,
} from "@/features/profile/presentation/components/profile-nav";
import { PersonalDataPanel } from "@/features/profile/presentation/components/panels/personal-data-panel";
import { SecurityPanel } from "@/features/profile/presentation/components/panels/security-panel";
import { RolePanel } from "@/features/profile/presentation/components/panels/role-panel";
import { OrganizationPanel } from "@/features/profile/presentation/components/panels/organization-panel";

/** Profile screen orchestrator: banner + tabbed panels. */
export function ProfileView({ initialProfile }: { initialProfile: Profile }) {
  const { data: profile } = useProfile(initialProfile);
  const [tab, setTab] = useState<ProfileTab>("personal");

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <ProfileHeader profile={profile} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <ProfileNav rol={profile.rol} active={tab} onChange={setTab} />
        </div>

        <div>
          {tab === "personal" && <PersonalDataPanel profile={profile} />}
          {tab === "security" && <SecurityPanel profile={profile} />}
          {tab === "role" && <RolePanel rol={profile.rol} />}
          {tab === "organization" && canOpenProfileTab(profile.rol, tab) && (
            <OrganizationPanel
              identificationId={profile.identificationId}
              rol={profile.rol}
            />
          )}
        </div>
      </div>
    </div>
  );
}
