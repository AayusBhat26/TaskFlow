"use client";

import { ReadOnlyEmoji } from "@/components/common/ReadOnlyEmoji";
import { StarSvg } from "@/components/common/StarSvg";
import { UserHoverInfo } from "@/components/common/UserHoverInfoCard";
import { Card, CardContent } from "@/components/ui/card";
import { useTruncateText } from "@/hooks/useTruncateText";
import { WorkspaceRecentActivity } from "@/types/extended";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import Link from "next/link";
import { TagItem } from "./TagItem";
import { AssignedToTaskUser } from "./AssignedToTaskUser";

interface Props {
  activity: WorkspaceRecentActivity;
}

export const RecentActivityItem = ({
  activity: { tags, title, emoji, starred, type, updated, assignedTo, link },
}: Props) => {
  const router = useRouter();

  const truncatedTitle = useTruncateText(title, 40);

  const c = useTranslations("COMMON");
  const format = useFormatter();
  const dateTime = new Date(updated.at);
  const now = new Date();

  const itemTypeSentence =
    type === "mindMap"
      ? c("EDITED_ITEM_SENTENCE.MIND_MAP")
      : c("EDITED_ITEM_SENTENCE.TASK");
  return (
    <Link href={link}>
      <Card className="bg-background border-none hover:bg-accent transition-colors duration-200 p-2">
        <CardContent className="flex w-full justify-between sm:items-center p-2 sm:p-2 pt-0">
          <div className="flex flex-row sm:gap-4 gap-2 w-full">
            <ReadOnlyEmoji
              className="sm:h-16 sm:w-16 h-12 w-12"
              selectedEmoji={emoji}
            />
            <div className="w-full">
              <div className="flex items-center">
                <h2 className="text-lg sm:text-2xl font-semibold">
                  {!title && type === "mindMap" && c("DEFAULT_NAME.MIND_MAP")}
                  {!title && type === "task" && c("DEFAULT_NAME.TASK")}
                  {title && truncatedTitle}
                </h2>
                {starred && <StarSvg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              {updated.by && (
                <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                  <p className="text-muted-foreground">{itemTypeSentence}</p>{" "}
                  {format.relativeTime(dateTime, now)}{" "}
                  {c("EDITED_ITEM_SENTENCE.BY")}
                  <div className="flex items-center gap-1">
                    <UserHoverInfo className="px-0" user={updated.by} />
                  </div>
                </div>
              )}
              <div className="flex items-center flex-wrap gap-1 mt-2">
                {assignedTo.map((user) => (
                  <AssignedToTaskUser key={user.id} userInfo={user} />
                ))}
                {tags.map((tag) => (
                  <TagItem key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
