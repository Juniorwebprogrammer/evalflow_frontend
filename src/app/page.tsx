import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";

export default async function Home() {
  const session = await readSession();
  redirect(session ? "/dashboard" : "/login");
}
