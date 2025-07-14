"use client";

import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useFilterByUsersAndTagsInWorkspace } from "@/context/FilterByUsersAndTagsInWorkspace";
import { useTruncateText } from "@/hooks/useTruncateText";
import { FilterUser } from "@/types/extended";
import { useTranslations } from "next-intl";

interface Props extends FilterUser {
  sessionUserId: string;
  active: boolean;
}

export const CommandUserItem = ({
  sessionUserId,
  active,
  username,
  id,
  image,
}: Props) => {
  const text = useTruncateText(username, 25);
  const { onChangeAssignedUser } = useFilterByUsersAndTagsInWorkspace();
  const t = useTranslations("WORKSPACE_MAIN_PAGE.COMMAND");
  return (
    <CommandItem className="p-0">
      <Button
        onClick={() => {
          onChangeAssignedUser(id);
        }}
        size={"sm"}
        variant={"ghost"}
        className="w-full h-fit justify-between px-2 py-1.5 text-xs"
      >
        <div className="flex items-center gap-2">
          <UserAvatar className="w-8 h-8" size={10} profileImage={image} />
          <p className="text-secondary-foreground">
            {sessionUserId === id ? t("ASSIGNED_TO_ME") : text}
          </p>
        </div>
      </Button>
    </CommandItem>
  );
};
