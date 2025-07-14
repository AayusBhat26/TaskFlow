"use client";

import { MAX_USER_WORKSPACES } from "@/lib/options";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Props {
  className?: string;
  createdNumber: number;
}

export const CreatedWorkspacesInfo = ({ className, createdNumber }: Props) => {
  const t = useTranslations("COMMON");

  return (
    <p
      className={cn(
        "text-muted-foreground sm:text-sm text-xs text-center",
        className
      )}
    >
      {t("ACTIVE_WORKSPACES.FIRST")}{" "}
      <span className="font-bold">
        {createdNumber} {t("ACTIVE_WORKSPACES.SECOND")} {MAX_USER_WORKSPACES}
      </span>{" "}
      {t("ACTIVE_WORKSPACES.THIRD")}
    </p>
  );
};
