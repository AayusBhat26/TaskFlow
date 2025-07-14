"use client";

import { useRouter } from "next-intl/client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useGetAssignedToMeParams = () => {
  const searchParams = useSearchParams();

  const typeParams = searchParams.get("type");

  const workspaceFilterParam = searchParams.get("workspace")
    ? searchParams.get("workspace")
    : "all";

  const router = useRouter();

  const currentType = useMemo(
    () =>
      typeParams &&
      (typeParams === "all" ||
        typeParams === "mind-maps" ||
        typeParams === "tasks")
        ? typeParams
        : "all",
    [typeParams]
  );

  return { currentType, workspaceFilterParam };
};
