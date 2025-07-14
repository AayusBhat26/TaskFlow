"use client";

import { Workspace } from "@prisma/client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createContext, useContext } from "react";

interface Props {
  children: React.ReactNode;
}

export const UserEditableWorkspacesCtx = createContext<UseQueryResult<
  Workspace[],
  Error
> | null>(null);

export const UserEditableWorkspacesProvider = ({ children }: Props) => {
  const { data } = useSession();

  const queryData = useQuery<Workspace[], Error>({
    queryFn: async () => {
      const userId = data?.user.id;
      const res = await fetch(
        `/api/workspace/get/user_editable_workspaces?userId=${userId}`
      );

      if (!res.ok) {
        const error = (await res.json()) as string;
        throw new Error(error);
      }

      const response = await res.json();

      return response;
    },
    enabled: !!data?.user.id,
    queryKey: ["getEditableWorkspaces", data?.user.id],
  });

  return (
    <UserEditableWorkspacesCtx.Provider value={queryData}>
      {children}
    </UserEditableWorkspacesCtx.Provider>
  );
};

export const useUserEditableWorkspaces = () => {
  const ctx = useContext(UserEditableWorkspacesCtx);
  if (!ctx) throw new Error(`invalid use`);
  return ctx;
};
