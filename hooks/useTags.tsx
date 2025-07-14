"use client";

import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { CustomColors, Tag } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { DebouncedState } from "use-debounce";
import { boolean } from "zod";

export const useTags = (
  workspaceId: string,
  isMounted: boolean,
  initialActiveTags: Tag[],
  onDebounced?: DebouncedState<() => void>
) => {
  const [currentActiveTags, setCurrentActiveTags] = useState(initialActiveTags);

  const { status, onSetStatus } = useAutosaveIndicator();

  const {
    data: tags,
    isLoading: isLoadingTags,
    isError,
  } = useQuery({
    queryFn: async () => {
      const res = await fetch(
        `/api/tags/get/get_workspace_tags?workspaceId=${workspaceId}`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      return data as Tag[];
    },
    enabled: isMounted,
    queryKey: ["getWorkspaceTags"],
  });

  const onDeleteActiveTagHandler = useCallback(
    (tagId: string) => {
      if (status !== "unsaved") onSetStatus("unsaved");
      setCurrentActiveTags((prevActiveTags) => {
        if (prevActiveTags.length === 0) return prevActiveTags;
        const updatedTags = prevActiveTags.filter((tag) => tag.id !== tagId);

        return updatedTags;
      });
      onDebounced && onDebounced();
    },
    [onSetStatus, status, onDebounced]
  );

  const onUpdateActiveTagHandler = useCallback(
    (tagId: string, color: CustomColors, name: string) => {
      setCurrentActiveTags((prevActiveTags) => {
        if (prevActiveTags.length === 0) return prevActiveTags;
        const updatedTags = prevActiveTags.map((tag) =>
          tag.id === tagId ? { ...tag, name, color } : tag
        );

        return updatedTags;
      });
    },
    []
  );

  const onSelectActiveTagHandler = useCallback(
    (tagId: string) => {
      if (status !== "unsaved") onSetStatus("unsaved");
      setCurrentActiveTags((prevActiveTags) => {
        const tagIndex = prevActiveTags.findIndex(
          (activeTag) => activeTag.id === tagId
        );

        if (tagIndex !== -1) {
          const updatedActiveTags = [...prevActiveTags];
          updatedActiveTags.splice(tagIndex, 1);
          return updatedActiveTags;
        } else {
          const selectedTag = tags!.find((tag) => tag.id === tagId);
          if (selectedTag) {
            return [...prevActiveTags, selectedTag];
          }
        }

        return prevActiveTags;
      });
      onDebounced && onDebounced();
    },
    [onSetStatus, status, tags, onDebounced]
  );

  return {
    tags,
    isError,
    isLoadingTags,
    currentActiveTags,
    onSelectActiveTagHandler,
    onUpdateActiveTagHandler,
    onDeleteActiveTagHandler,
  };
};
