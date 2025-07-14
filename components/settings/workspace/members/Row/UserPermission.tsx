"use client";

import { SubscriptionUser } from "@/types/extended";
import { UserPermission as UserPermissionType } from "@prisma/client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next-intl/client";
import { useTranslations } from "next-intl";
import { LoadingState } from "@/components/ui/loadingState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useChangeCodeToEmoji } from "@/hooks/useChangeCodeToEmoji";

interface Props {
  userRole: UserPermissionType;
  user: {
    id: string;
    image?: string | null | undefined;
    username: string;
  };
  workspaceId: string;
  onSetworkspacesubscribers: React.Dispatch<
    React.SetStateAction<SubscriptionUser[]>
  >;
}

export const UserPermission = ({
  userRole,
  user,
  workspaceId,
  onSetworkspacesubscribers,
}: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("PERMISSIONS");
  const m = useTranslations("MESSAGES");
  const userRoleEmojis = useChangeCodeToEmoji(
    "1f432",
    "1f60e",
    "1f920",
    "1f913"
  );
  const { mutate: editUserRole, isPending } = useMutation({
    mutationFn: async (role: UserPermissionType) => {
      const { data } = (await axios.post("/api/workspace/users/edit_role", {
        userId: user.id,
        workspaceId,
        newRole: role,
      })) as AxiosResponse<UserPermissionType>;
      return data;
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: async (res: UserPermissionType) => {
      onSetworkspacesubscribers((current) =>
        current.map((currentSubscribers) => {
          if (currentSubscribers.user.id === user.id) {
            return {
              ...currentSubscribers,
              userRole: res,
            };
          }
          return currentSubscribers;
        })
      );
      router.refresh();
    },
    mutationKey: ["editUserRole"],
  });
  return (
    <div>
      {isPending ? (
        <div className="flex items-center">
          <LoadingState loadingText={t("WAIT")} />
        </div>
      ) : (
        <>
          {userRole === "OWNER" ? (
            <div className="flex gap-1 h-9 items-center px-3 text-sm font-medium">
              <span className="hidden sm:inline">{userRoleEmojis[0]}</span>
              <span>{t("OWNER.TITLE")}</span>
            </div>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="flex gap-1 items-center"
                >
                  {userRole === "ADMIN" && (
                    <p className="flex gap-1 items-center">
                      <span className="hidden sm:inline">
                        {userRoleEmojis[1]}
                      </span>{" "}
                      <span>{t("ADMIN.TITLE")}</span>
                    </p>
                  )}
                  {userRole === "CAN_EDIT" && (
                    <p className="flex gap-1 items-center">
                      <span className="hidden sm:inline">
                        {userRoleEmojis[2]}
                      </span>{" "}
                      <span>{t("EDITOR.TITLE")}</span>
                    </p>
                  )}
                  {userRole === "READ_ONLY" && (
                    <p className="flex gap-1 items-center">
                      <span className="hidden sm:inline">
                        {userRoleEmojis[3]}
                      </span>{" "}
                      <span>{t("VIEWER.TITLE")}</span>
                    </p>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-xs">
                <DropdownMenuItem
                  onClick={() => {
                    editUserRole("ADMIN");
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span>{userRoleEmojis[1]}</span>{" "}
                        <span>{t("ADMIN.TITLE")}</span>
                      </div>
                      {userRole === "ADMIN" && <Check size={18} />}
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {t("ADMIN.DESC")}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    editUserRole("CAN_EDIT");
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span>{userRoleEmojis[2]}</span>{" "}
                        <span>{t("EDITOR.TITLE")}</span>
                      </div>
                      {userRole === "CAN_EDIT" && <Check size={18} />}
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {t("EDITOR.DESC")}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    editUserRole("READ_ONLY");
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span>{userRoleEmojis[3]}</span>{" "}
                        <span>{t("VIEWER.TITLE")}</span>
                      </div>
                      {userRole === "READ_ONLY" && <Check size={18} />}
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {t("VIEWER.DESC")}
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
};
