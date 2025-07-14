"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useFilterByUsersAndTagsInWorkspace } from "@/context/FilterByUsersAndTagsInWorkspace";
import { useTruncateText } from "@/hooks/useTruncateText";
import { FilterUser } from "@/types/extended";

interface Props extends FilterUser {}

export const ActiveFilteredUser = ({ username, id, image }: Props) => {
  const { onClearUser } = useFilterByUsersAndTagsInWorkspace();
  const text = useTruncateText(username, 25);

  return (
    <Button
      size={"sm"}
      variant={"outline"}
      className="w-fit h-9 flex gap-2 items-center px-2 py-1.5 text-xs rounded-lg"
    >
      <UserAvatar className="w-6 h-6" size={10} profileImage={image} />
      <p className="text-secondary-foreground">{text}</p>
    </Button>
  );
};
