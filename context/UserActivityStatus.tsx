"use client";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { UserActiveItemList } from "@/types/extended";
import { UserPermission } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Props {
  children: React.ReactNode;
}

interface UserActivityStatus {
  isLoading: boolean;
  isError: boolean;

  allUsers: UserActiveItemList[];
  allActiveUsers: UserActiveItemList[];
  allInactiveUsers: UserActiveItemList[];

  getActiveUsersRoleType: (role: UserPermission) => UserActiveItemList[];
  checkIfUserIsActive: (id: string) => boolean;
  refetch: () => void;
}

export const UserActivityStatusCtx = createContext<UserActivityStatus | null>(
  null
);

export const UserActivityStatusProvider = ({ children }: Props) => {
  const { toast } = useToast();
  const m = useTranslations("MESSAGES");

  const [allInactiveUsers, setAllInactiveUsers] = useState<
    UserActiveItemList[]
  >([]);
  const [allActiveUsers, setAllActiveUsers] = useState<UserActiveItemList[]>(
    []
  );

  const params = useParams();
  const session = useSession();
  const workspaceId = params.workspace_id ? params.workspace_id : null;

  const {
    data: users,
    isError,
    isLoading,
    refetch,
  } = useQuery<UserActiveItemList[], Error>({
    queryFn: async () => {
      const res = await fetch(
        `/api/users/get-users?workspaceId=${workspaceId}`
      );

      if (!res.ok) {
        const error = (await res.json()) as string;
        throw new Error(error);
      }

      const response = await res.json();

      return response;
    },
    enabled: !!workspaceId,
    queryKey: ["getUserActivityStatus", workspaceId],
  });

  useEffect(() => {
    if (!session.data) return;

    const supabaseClient = supabase();
    const channel = supabaseClient.channel(`activity-status`);
    channel
      .on("presence", { event: "sync" }, () => {
        const userIds: string[] = [];

        const activeUsers: UserActiveItemList[] = [];
        const inactiveUsers: UserActiveItemList[] = [];

        for (const id in channel.presenceState()) {
          //@ts-ignore
          userIds.push(channel.presenceState()[id][0].userId);
        }

        const uniqueIds = new Set(userIds);

        users &&
          users.forEach((user) => {
            if (uniqueIds.has(user.id)) {
              activeUsers.push(user);
            } else {
              inactiveUsers.push(user);
            }
          });

        setAllActiveUsers(activeUsers);
        setAllInactiveUsers(inactiveUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            userId: session.data.user.id,
          });
        }
      });
  }, [session.data, users]);

  const getActiveUsersRoleType = useCallback(
    (role: UserPermission) => {
      return allActiveUsers.filter((user) => user.userRole === role);
    },
    [allActiveUsers]
  );

  const checkIfUserIsActive = useCallback(
    (id: string) => !!allActiveUsers?.find((user) => user.id === id),
    [allActiveUsers]
  );

  const info: UserActivityStatus = {
    isLoading,
    isError,
    allUsers: users ?? [],
    allActiveUsers,
    allInactiveUsers,
    getActiveUsersRoleType,
    checkIfUserIsActive,
    refetch,
  };

  return (
    <UserActivityStatusCtx.Provider value={info}>
      {children}
    </UserActivityStatusCtx.Provider>
  );
};

export const useUserActivityStatus = () => {
  const ctx = useContext(UserActivityStatusCtx);
  if (!ctx) throw new Error("invalid use");

  return ctx;
};
