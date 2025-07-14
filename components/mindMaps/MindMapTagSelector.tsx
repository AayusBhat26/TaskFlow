"use client";

import { Tag } from "@prisma/client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { TagSelector } from "../common/tag/TagSelector";
import { useTags } from "@/hooks/useTags";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { useDebouncedCallback } from "use-debounce";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { LinkTag } from "../tasks/editable/tag/LinkTag";
import { useTranslations } from "next-intl";

interface Props {
  mindMapId: string;
  workspaceId: string;
  isMounted: boolean;
  initialActiveTags: Tag[];
}

export const MindMapTagsSelector = ({
  mindMapId,
  workspaceId,
  isMounted,
  initialActiveTags,
}: Props) => {
  const { onSetStatus } = useAutosaveIndicator();
  const t = useTranslations("MIND_MAP");
  const { mutate: updateMindMapActiveTags } = useMutation({
    mutationFn: async (tagsIds: string[]) => {
      await axios.post(`/api/mind_maps/update/tags`, {
        workspaceId,
        tagsIds,
        mindMapId,
      });
    },
    onSuccess: () => {
      onSetStatus("saved");
    },
    onError: () => {
      onSetStatus("unsaved");
    },
  });

  const debouncedCurrentActiveTags = useDebouncedCallback(() => {
    onSetStatus("pending");
    const tagsIds = currentActiveTags.map((tag) => tag.id);
    updateMindMapActiveTags(tagsIds);
  });

  const {
    currentActiveTags,
    tags,
    isLoadingTags,
    isError,
    onDeleteActiveTagHandler,
    onSelectActiveTagHandler,
    onUpdateActiveTagHandler,
  } = useTags(
    workspaceId,
    isMounted,
    initialActiveTags,
    debouncedCurrentActiveTags
  );
  return (
    <>
      <HoverCard openDelay={250} closeDelay={250}>
        <HoverCardTrigger>
          <TagSelector
            plusIconSize={22}
            isError={isError}
            className="border-none h-9 px-2.5 py-0 text-base"
            workspaceId={workspaceId}
            tags={tags}
            currentActiveTags={currentActiveTags}
            onSelectActiveTag={onSelectActiveTagHandler}
            onUpdateActiveTags={onUpdateActiveTagHandler}
            onDeleteActiveTag={onDeleteActiveTagHandler}
            isLoading={isLoadingTags}
            dropDownSizeOffset={10}
          />
        </HoverCardTrigger>
        <HoverCardContent sideOffset={8} align="start">
          {t("TAG")}
        </HoverCardContent>
      </HoverCard>
      {currentActiveTags.length > 0 && (
        <ScrollArea className="hidden sm:block max-w-[15rem] md:max-w-[24rem]">
          <div className="flex w-max space-x-2 py-2">
            {currentActiveTags.map((tag) => (
              <LinkTag disabled key={tag.id} tag={tag} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </>
  );
};
