"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import axios, { AxiosError } from "axios";
import { StarredItem } from "@/types/saved";

interface Props {
  id: string;
  itemId: string;
  type: "mindMap" | "task";
  userId: string;
  sortType: "asc" | "desc";
}

export const useUnstarItem = ({
  id,
  itemId,
  sortType,
  type,
  userId,
}: Props) => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const m = useTranslations("MESSAGES");

  const router = useRouter();

  const body = type === "mindMap" ? { mindMapId: itemId } : { taskId: itemId };

  const api =
    type === "mindMap"
      ? `/api/saved/mind_maps/toggle_mind_map`
      : `/api/saved/tasks/toggleTask`;

  const { mutate: unstarItem } = useMutation({
    mutationFn: async () => {
      await axios.post(api, body);
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getStarredItems", userId, sortType]);
      const previousStarredItems = queryClient.getQueryData<StarredItem[]>([
        "getStarredItems",
        userId,
        sortType,
      ]);

      const checkedPreviousStarredItems =
        previousStarredItems && previousStarredItems.length > 0
          ? previousStarredItems
          : [];

      const updatedStarredItems = checkedPreviousStarredItems.filter(
        (starItem) => starItem.id !== id
      );

      queryClient.setQueryData(
        ["getStarredItems", userId, sortType],
        updatedStarredItems
      );

      return { checkedPreviousStarredItems };
    },
    onError: (err: AxiosError, _, context) => {
      queryClient.setQueryData(
        ["getStarredItems", userId, sortType],
        context?.checkedPreviousStarredItems
      );

      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getStarredItems", userId, sortType]);
      router.refresh();
    },

    mutationKey: ["unstarItem"],
  });

  return unstarItem;
};
