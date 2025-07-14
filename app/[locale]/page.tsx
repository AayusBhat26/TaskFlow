"use client";

import { HomePage } from "@/components/home/HomePage";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

const Home = () => {
  const session = useSession();

  // if (session) redirect("/dashboard");

  return <HomePage />;
};

export default Home;
