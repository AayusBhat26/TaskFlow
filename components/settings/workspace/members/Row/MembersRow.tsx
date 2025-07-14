"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { SubscriptionUser } from "@/types/extended";
import { UserPermission as UserPermissionType } from "@prisma/client";
import React from "react";
import { MoreOptions } from "./MoreOptions";
import { UserPermission } from "./UserPermission";

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

export const MembersRow = ({
  user,
  userRole,
  workspaceId,
  onSetworkspacesubscribers,
}: Props) => {
  return (
    <li className="w-full grid grid-cols-3 items-center grid-rows-1 gap-4 p-4 border-b last:border-b-0 text-sm sm:text-base h-16">
      <div className="flex items-center gap-2">
        <UserAvatar
          profileImage={user.image}
          size={14}
          className="w-8 h-8 hidden sm:flex"
        />
        <p className="font-semibold">{user.username}</p>
      </div>
      <UserPermission
        workspaceId={workspaceId}
        user={user}
        userRole={userRole}
        onSetworkspacesubscribers={onSetworkspacesubscribers}
      />

      <MoreOptions
        workspaceId={workspaceId}
        userId={user.id}
        userRole={userRole}
        onSetworkspacesubscribers={onSetworkspacesubscribers}
      />
    </li>
  );
};
