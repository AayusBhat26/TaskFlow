"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { useUserActivityStatus } from "@/context/UserActivityStatus";
import { useTranslations } from "next-intl";
import { UserStatusTypeList } from "./UserStatusTypeList";

export const UsersContainer = () => {
  const t = useTranslations("USERS_STATUS_LIST");
  const {
    isLoading,
    getActiveUsersRoleType,
    allActiveUsers,
    allInactiveUsers,
    isError,
    refetch,
  } = useUserActivityStatus();

  const owners = getActiveUsersRoleType("OWNER");
  const admins = getActiveUsersRoleType("ADMIN");
  const editors = getActiveUsersRoleType("CAN_EDIT");
  const viewers = getActiveUsersRoleType("READ_ONLY");

  if (isError) {
    return (
      <div className="flex flex-col justify-center text-center gap-6 mt-6">
        <p className="text-sm text-muted-foreground">{t("ERROR.MG")}</p>
        <Button size={"sm"} onClick={refetch}>
          {t("ERROR.BTN")}
        </Button>
      </div>
    );
  } else {
    return (
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center w-full h-28 mt-2">
            <LoadingState />
          </div>
        ) : (
          <>
            <UserStatusTypeList
              title={t("ROLES.OWNER")}
              users={owners}
              active
            />
            <UserStatusTypeList
              title={t("ROLES.ADMIN")}
              users={admins}
              active
            />
            <UserStatusTypeList
              title={t("ROLES.CAN_EDIT")}
              users={editors}
              active
            />
            <UserStatusTypeList
              title={t("ROLES.READ_ONLY")}
              users={viewers}
              active
            />
            <UserStatusTypeList
              title={t("ROLES.UNAVAILABLE")}
              users={allInactiveUsers}
            />
          </>
        )}
      </div>
    );
  }
};
