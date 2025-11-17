import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Dashboard from "@/components/dashboard/Dashboard";
import {
  getCurrentAdminFromBackend,
  getAllLevelConfigsFromBackend,
} from "@/lib/api-server";

export default async function Home() {
  const cookieStore = await cookies();

  const admin = await getCurrentAdminFromBackend(cookieStore);
  if (!admin) {
    redirect("/login");
  }

  const levels = await getAllLevelConfigsFromBackend(cookieStore);

  return (
    <Dashboard initialLevels={levels} adminEmail={admin.email} />
  );
}
