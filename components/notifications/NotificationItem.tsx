"use client";

import { useTruncateText } from "@/hooks/useTruncateText";
import { UserAvatar } from "../ui/user-avatar";
import { Button } from "../ui/button";
import { BellDot } from "lucide-react";
import { UserNotification } from "@/types/extended";
import { useFormatter, useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCreateNotifyItemDay } from "@/hooks/useCreateNotifyItemDay";
import axios, { AxiosError } from "axios";
import Link from "next/link";

interface Props {
  notify: UserNotification;
}

export const NotificationItem = ({
  notify: {
    notifyCreator: { image, username },
    clicked,
    createdDate,
    workspace,
    newUserRole,
    taskId,
    mindMapId,
    notifyType,
    id,
  },
}: Props) => {
  const name = useTruncateText(username, 20);
  const m = useTranslations("MESSAGES");
  const queryClient = useQueryClient();

  const format = useFormatter();
  const dateTime = new Date(createdDate);
  const now = new Date();

  const { toast } = useToast();

  const { link, textContent } = useCreateNotifyItemDay(
    notifyType,
    newUserRole,
    workspace,
    taskId,
    mindMapId
  );

  const { mutate: updateToClickStatus } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/notifications/set-click/by-id`, { id });
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getUserNotifications"]);
      const previousNotifications = queryClient.getQueryData<
        UserNotification[]
      >(["getUserNotifications"]);

      const checkedPreviousNotifications =
        previousNotifications && previousNotifications.length > 0
          ? previousNotifications
          : [];

      const updatedNotifications = checkedPreviousNotifications.map(
        (notify) => {
          if (notify.id === id) {
            return {
              ...notify,
              clicked: true,
            };
          } else return notify;
        }
      );

      queryClient.setQueryData(["getUserNotifications"], updatedNotifications);

      return { checkedPreviousNotifications };
    },
    onError: (err: AxiosError, _, context) => {
      queryClient.setQueryData(
        ["getUserNotifications"],
        context?.checkedPreviousNotifications
      );

      toast({
        title: m("ERRORS.CANT_UPDATE_SEEN_NOTIFY"),
        variant: "destructive",
      });
    },
    onSettled: () => {
      //@ts-ignore
      queryClient.invalidateQueries["getUserNotifications"];
    },
    mutationKey: ["updateToClickStatus"],
  });
  return (
    <Link
      href={link}
      onClick={() => {
        !clicked && updateToClickStatus();
      }}
    >
      <div className="flex gap-4">
        <div>
          <UserAvatar className="w-10 h-10" size={12} />
        </div>
        <div className="flex gap-4">
          <div className="w-full text-sm flex flex-col gap-1">
            <p>
              <span className="font-bold">{name}</span>
              {textContent}
            </p>
            <p
              className={`text-xs transition-colors duration-200 ${
                clicked ? "text-muted-foreground" : "text-primary font-bold"
              } `}
            >
              {format.relativeTime(dateTime, now)}
            </p>
          </div>
          {!clicked && (
            <div>
              <div className="h-6 w-6 text-primary">
                <BellDot size={16} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
