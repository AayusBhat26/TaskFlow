"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { UserPermission } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  Icon: LucideIcon;
  userRole: UserPermission | null;
  href: string;
}

export const ShortcutContainerLinkItem = ({
  Icon,
  title,
  userRole,
  href,
}: Props) => {
  return (
    <Link
      href={href}
      className={`text-sm md:text-base min-w-[10rem] sm:min-w-[13rem] h-14 p-2 rounded-lg shadow-sm flex justify-center items-center gap-1 md:gap-2 ${
        userRole !== "OWNER" ? "w-1/5" : "w-1/4"
      }`}
    >
      <Icon size={16} />
      <h4 className="break-words">{title}</h4>
    </Link>
  );
};
