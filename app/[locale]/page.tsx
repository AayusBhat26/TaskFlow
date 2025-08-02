import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HomePage } from "@/components/home/HomePage";

export default async function Home() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return <HomePage />;
}
