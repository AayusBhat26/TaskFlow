"use client";

import { StarredItem as StarredItemType } from "@/types/saved";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { ReadOnlyEmoji } from "../common/ReadOnlyEmoji";
import { MoreHorizontal, Star, StarOff } from "lucide-react";
import { UserHoverInfo } from "../common/UserHoverInfoCard";
import { Button, buttonVariants } from "../ui/button";
import { useUnstarItem } from "@/hooks/useUnstarItem";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StarSvg } from "../common/StarSvg";

interface Props {
  item: StarredItemType;
  sortType: "asc" | "desc";
  userId: string;
}

export const StarredItem = ({
  item: {
    emoji,
    id,
    link,
    title,
    type,
    updated,
    workspaceName,
    itemId,
    workspaceId,
  },
  sortType,
  userId,
}: Props) => {
  const onUnstar = useUnstarItem({ id, itemId, sortType, type, userId });
  const format = useFormatter();
  const dateTime = new Date(updated.at);
  const now = new Date();

  const t = useTranslations("STARRED");
  const c = useTranslations("COMMON");

  const itemTypeSentence = useMemo(() => {
    return type === "mindMap"
      ? c("EDITED_ITEM_SENTENCE.MIND_MAP")
      : c("EDITED_ITEM_SENTENCE.TASK");
  }, [type]);

  const unstarHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    onUnstar();
  };
  return (
    <Link
      href={link}
      className="hover:scale-[1.01] transition-transform duration-200"
    >
      <Card>
        <CardContent className="flex w-full justify-between sm:items-center pt-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full">
            <ReadOnlyEmoji
              className="sm:h-16 sm:w-16 h-12 w-12"
              selectedEmoji={emoji}
            />
            <div className="w-full">
              <div className="flex items-center">
                <h2 className="text-lg sm:text-2xl font-semibold">
                  {!title && type === "mindMap" && t("DEFAULT_NAME.MIND_MAP")}
                  {!title && type === "task" && t("DEFAULT_NAME.TASK")}
                  {title && title}
                </h2>
                <StarSvg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {updated.by && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                  <p className="text-muted-foreground">{itemTypeSentence}</p>{" "}
                  {format.relativeTime(dateTime, now)}{" "}
                  {c("EDITED_ITEM_SENTENCE.BY")}
                  <div className="flex items-center gap-1">
                    <UserHoverInfo className="px-0" user={updated.by} />
                    <p>
                      {c("EDITED_ITEM_SENTENCE.IN")}{" "}
                      <Link
                        className={cn(
                          `${buttonVariants({
                            variant: "link",
                          })} px-0`
                        )}
                        href={`/dashboard/workspace/${workspaceId}`}
                      >
                        {workspaceName}
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={unstarHandler}
                className="cursor-pointer"
              >
                <StarOff size={18} />{" "}
                <span className="ml-2">{t("UNSTAR")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </Link>
  );
};
