"use client";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UserNotification } from "@/types/extended";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { LoadingState } from "../ui/loadingState";
import { ClientError } from "../error/ClientError";

interface Props {
  userId: string;
}

export const NotificationContainer = ({ userId }: Props) => {
  const queryClient = useQueryClient();
  const m = useTranslations("MESSAGES");
  const t = useTranslations("NOTIFICATIONS");

  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [unseenNotifications, setUnseenNotifications] = useState<
    UserNotification[]
  >([]);
  const [isAnyClickedFalse, setIsAnyClickedFalse] = useState(false);

  const {
    data: userNotifications,
    isError,
    isLoading,
    refetch,
  } = useQuery<UserNotification[], Error>({
    queryFn: async () => {
      const res = await fetch(`/api/notifications/get?userId=${userId}`);

      if (!res.ok) {
        const error = (await res.json()) as string;
        throw new Error(error);
      }

      const response = await res.json();

      return response;
    },
    refetchInterval: 6000,
    gcTime: 1 * 60 * 1000,
    queryKey: ["getUserNotifications"],
  });
  const { mutate: updateAllToClickStatus } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/notifications/set-click/all`);
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getUserNotifications"]);
      const previousNotifications = userNotifications;

      const checkedPreviousNotifications =
        previousNotifications && previousNotifications.length > 0
          ? previousNotifications
          : [];

      const updatedNotifications = checkedPreviousNotifications.map(
        (notify) => {
          return {
            ...notify,
            clicked: true,
          };
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
    mutationKey: ["updateAllToClickStatus"],
  });

  const { mutate: updateToSeenNotifications } = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/notifications/set-seen`);
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getUserNotifications"]);
      const previousNotifications = userNotifications;

      const checkedPreviousNotifications =
        previousNotifications && previousNotifications.length > 0
          ? previousNotifications
          : [];

      const updatedNotifications = checkedPreviousNotifications.map(
        (notify) => {
          return {
            ...notify,
            seen: true,
          };
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
    mutationKey: ["updateToSeenNotifications"],
  });

  useEffect(() => {
    if (!userNotifications) return;

    const unseen = userNotifications.filter(
      (notification) => !notification.seen
    );
    const isAnyClicked = userNotifications.some((notify) => !notify.clicked);

    setIsAnyClickedFalse(isAnyClicked);
    setUnseenNotifications(unseen);
  }, [userNotifications]);

  useEffect(() => {
    if (unseenNotifications.length === 0 || !open) return;

    updateToSeenNotifications();
  }, [open, unseenNotifications, updateToSeenNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={250} closeDelay={250}>
        <PopoverTrigger asChild>
          <HoverCardTrigger>
            <Button
              className="w-6 h-6 sm:h-9 sm:w-9 relative"
              variant={"ghost"}
              size={"icon"}
            >
              <Bell size={16} />
              {unseenNotifications.length !== 0 && (
                <div className="absolute text-white top-0 right-0 bg-primary rounded-full border border-border w-3.5 h-3.5 sm:w-4 sm:h-4 flex justify-center items-center text-xs">
                  <p>
                    {unseenNotifications.length > 9
                      ? "+9"
                      : unseenNotifications.length}
                  </p>
                </div>
              )}
            </Button>
          </HoverCardTrigger>
        </PopoverTrigger>
        <HoverCardContent>
          <span>{t("TITLE")}</span>
        </HoverCardContent>
        <PopoverContent
          side="bottom"
          align="end"
          className="w-fit max-w-[300px] sm:max-w-[390px] p-2 sm:p-4"
        >
          {isError ? (
            <ClientError
              onRefetch={refetch}
              className="bg-popover mt-0 sm:mt-0 md:mt-0"
              message={t("ERROR")}
            />
          ) : isLoading ? (
            <div className="w-28 h-28 flex justify-center items-center">
              <LoadingState className="w-6 h-6" />
            </div>
          ) : userNotifications && userNotifications?.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="flex gap-2 sm:gap-6 items-center justify-between">
                <h4 className="font-medium leading-none">{t("TITLE")}</h4>
                <Button
                  disabled={!isAnyClickedFalse}
                  onClick={() => {
                    updateAllToClickStatus();
                  }}
                  className="text-xs"
                  size={"sm"}
                  variant={"secondary"}
                >
                  {t("MARK_AS_READ")}
                </Button>
              </div>
              <ScrollArea
                className={`${
                  userNotifications.length >= 4
                    ? userNotifications.length >= 8
                      ? "h-96"
                      : "h-72"
                    : "h-56"
                }`}
              >
                <div className="flex flex-col gap-3 h-full">
                  {userNotifications?.map((notify) => (
                    <NotificationItem key={notify.id} notify={notify} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="py-2">
              <p className="font-semibold">{t("NO_NOTIFICATIONS")}</p>
            </div>
          )}
        </PopoverContent>
      </HoverCard>
    </Popover>
  );
};
