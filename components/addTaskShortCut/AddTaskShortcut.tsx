"use client";

import { Task, Workspace } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ExternalLink, PencilRuler } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChangeCodeToEmoji } from "@/hooks/useChangeCodeToEmoji";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next-intl/client";
import { DateRange } from "react-day-picker";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { LoadingState } from "../ui/loadingState";
import { MainTab } from "./MainTab";
import { Workspaces } from "./Workspaces";
import { useUserEditableWorkspaces } from "@/context/UserEditableWorkspaces";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { ClientError } from "../error/ClientError";

interface Props {
  userId: string;
}

export const AddTaskShortcut = ({ userId }: Props) => {
  const [open, setOpen] = useState(false);
  const m = useTranslations("MESSAGES");
  const t = useTranslations("TASK_SHORTCUT");

  const {
    data: workspaces,
    isError,
    isLoading: isGettingWorkspaces,
    refetch,
  } = useUserEditableWorkspaces();

  const queryclient = useQueryClient();

  const [currentTab, setCurrentTab] = useState<"main" | "workspaces">("main");
  const [selectedEmoji, setSelectedEmoji] = useState("1f9e0");
  const renderedEmoji = useChangeCodeToEmoji(selectedEmoji);

  const { toast } = useToast();
  const router = useRouter();

  const [newTaskLink, setNewTaskLink] = useState<null | string>(null);

  const [activeWorkspace, setActiveWorkspace] = useState<null | Workspace>(
    null
  );

  useEffect(() => {
    if (workspaces) setActiveWorkspace(workspaces[0]);
  }, [workspaces]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [title, setTitle] = useState("");

  const selectedDateHandler = (date: DateRange | undefined) => {
    setDate(date);
  };

  const changeTitleHandler = (title: string) => {
    setTitle(title);
  };

  const selectEmojiHandler = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const changeTabHandler = (tab: "main" | "workspaces") => {
    setCurrentTab(tab);
  };

  const onSelectActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    setCurrentTab("main");
  };

  useEffect(() => {
    let timeOutId: NodeJS.Timeout;

    if (!open) {
      timeOutId = setTimeout(() => {
        setCurrentTab("main");
        setNewTaskLink(null);
      }, 200);
    }

    return () => {
      clearTimeout(timeOutId);
    };
  }, [open]);

  const { mutate: newShortTask, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/task/create_short_task`, {
        workspaceId: activeWorkspace?.id,
        icon: selectedEmoji,
        title,
        date,
      });

      return data as Task;
    },

    onSuccess: async (data: Task) => {
      //@ts-ignore
      await queryclient.refetchQueries(["getCalendarItems", userId]);

      toast({
        title: m("SUCCES.TASK_ADDED"),
      });

      setNewTaskLink(
        `/dashboard/workspace/${data.workspaceId}/tasks/task/${data.id}/edit`
      );
      setTitle("");
      setSelectedEmoji("1f9e0");
      setActiveWorkspace(workspaces ? workspaces[0] : null);
      setDate({
        from: undefined,
        to: undefined,
      });
      router.refresh();
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onMutate: () => {},
    mutationKey: ["newShortTask"],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={250} closeDelay={250}>
        <HoverCardTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size={"icon"}
              variant={"ghost"}
              className="w-8 h-8 sm:w-9 sm:h-9"
            >
              <PencilRuler size={18} />
            </Button>
          </DialogTrigger>
        </HoverCardTrigger>
        <HoverCardContent align="center">
          <span>{t("HINT")}</span>
        </HoverCardContent>
      </HoverCard>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex flex-col items-start gap-2">
            {newTaskLink && (
              <Link
                target="_blank"
                className="w-full cursor-pointer"
                href={newTaskLink}
                onClick={() => {
                  setOpen(false);
                }}
              >
                <div className="mt-6 mb-4 p-2 border border-primary rounded-md bg-primary/10 w-full text-primary font-semibold flex justify-between items-center">
                  <p>{t("ADDED_TASK")}</p>
                  <ExternalLink />
                </div>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {currentTab === "workspaces" && (
                <Button
                  onClick={() => {
                    changeTabHandler("main");
                  }}
                  className="h-8 w-8"
                  variant={"ghost"}
                  size={"icon"}
                >
                  <ChevronLeft />
                </Button>
              )}

              <DialogTitle>
                {currentTab === "main" ? t("TITLE") : t("CHOOSE_WORKSPACE")}
              </DialogTitle>
            </div>
          </div>
          {currentTab === "main" && (
            <DialogDescription className="text-left">
              {t("DESC")}
            </DialogDescription>
          )}
        </DialogHeader>
        {isError ? (
          <ClientError
            message="Error fetching workspaces"
            onRefetch={refetch}
            className="mt-0 sm:mt-0 md:mt-0"
          />
        ) : (
          <>
            {isGettingWorkspaces ? (
              <div className="w-full h-20 flex justify-center items-center">
                <LoadingState className="w-10 h-10" />
              </div>
            ) : (
              <>
                {" "}
                <div className="flex flex-col w-full my-4 gap-6">
                  {currentTab === "main" ? (
                    <MainTab
                      date={date}
                      title={title}
                      renderedEmoji={renderedEmoji}
                      activeWorkspace={activeWorkspace}
                      onChangeTitle={changeTitleHandler}
                      onSelectedDate={selectedDateHandler}
                      onChangeTabHandler={changeTabHandler}
                      onSelectEmojiHandler={selectEmojiHandler}
                    />
                  ) : (
                    <Workspaces
                      workspaces={workspaces}
                      onSelectActiveWorkspace={onSelectActiveWorkspace}
                    />
                  )}
                </div>
                {currentTab === "main" && (
                  <DialogFooter className="w-full">
                    {activeWorkspace ? (
                      <Button
                        size={"lg"}
                        onClick={() => newShortTask()}
                        disabled={
                          !activeWorkspace || title.length === 0 || isPending
                        }
                        className="w-full text-white"
                      >
                        {isPending ? (
                          <LoadingState loadingText={t("BTN_PENDING")} />
                        ) : (
                          t("BTN_ADD")
                        )}
                      </Button>
                    ) : (
                      <Button
                        size={"lg"}
                        onClick={() => setOpen(false)}
                        className="w-full text-white"
                      >
                        {t("BTN_NO_WORKSPACES")}
                      </Button>
                    )}
                  </DialogFooter>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
