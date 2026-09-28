import { getCurrentProfile } from "@/app/dashboard/current-profile";
import { ProfileView } from "@/features/profile/presentation/components/profile-view";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();

  return <ProfileView initialProfile={profile} />;
}
