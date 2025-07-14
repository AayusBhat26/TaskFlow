"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { useToast } from "@/hooks/use-toast";
import {
  titleAndEmojiSchema,
  TitleAndEmojiSchema,
} from "@/schema/mindMapSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ChangeEmoji } from "./ChangeEmoji";
import TextareaAutoSize from "react-textarea-autosize";
import { useTranslations } from "next-intl";

interface Props {
  workspaceId: string;
  mapId: string;
  emoji: string;
  title?: string;
}

export const EditInfo = ({ workspaceId, mapId, emoji, title }: Props) => {
  const [open, setOpen] = useState(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const { onSetStatus, status } = useAutosaveIndicator();
  const { toast } = useToast();
  const t = useTranslations("MIND_MAP.EDIT_TITLE_AND_EMOJI");

  const { mutate: updateMindMap } = useMutation({
    mutationFn: async ({ icon, title }: { icon: string; title?: string }) => {
      await axios.post(`/api/mind_maps/update/title_and_emoji`, {
        mapId,
        workspaceId,
        icon,
        title,
      });
    },
    onSuccess: () => {
      onSetStatus("saved");
    },
    onError: () => {
      onSetStatus("unsaved");
      toast({
        title: t("ERROR"),
        variant: "destructive",
      });
    },
  });

  const form = useForm<TitleAndEmojiSchema>({
    resolver: zodResolver(titleAndEmojiSchema),
    defaultValues: {
      icon: emoji,
      title: title ? title : "",
    },
  });

  const onFormSelectHandler = (emoji: string) => {
    form.setValue("icon", emoji);
  };

  const onSaveEdit = useCallback(() => {
    onSetStatus("pending");
    const { icon, title } = form.getValues();
    setOpen(false);

    updateMindMap({ icon, title });
  }, [form, onSetStatus, updateMindMap]);

  const { ref: titleRef, ...rest } = form.register("title");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={250} closeDelay={250}>
        <SheetTrigger asChild>
          <HoverCardTrigger>
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setOpen(true)}
            >
              <Pencil size={20} />
            </Button>
          </HoverCardTrigger>
        </SheetTrigger>
        <HoverCardContent sideOffset={8} align="start">
          {t("HOVER")}
        </HoverCardContent>
        <SheetContent className="md:w-[26rem] md:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("TITLE")}</SheetTitle>
            <SheetDescription>{t("DESC")}</SheetDescription>
          </SheetHeader>

          <form id="mind-map-info" className="mt-8 w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-4 md:items-center">
              <ChangeEmoji
                emoji={form.getValues("icon")}
                onFormSelect={onFormSelectHandler}
              />
              <TextareaAutoSize
                maxLength={100}
                {...rest}
                ref={(e) => {
                  titleRef(e);
                  //@ts-ignore
                  _titleRef.current = e;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                placeholder={t("PLACEHOLDER")}
                className="w-full resize-none appearance-none overflow-hidden bg-transparent placeholder:text-muted-foreground text-2xl font-semibold focus:outline-none"
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 items-center w-full">
              <Button
                onClick={() => {
                  setOpen(false);
                }}
                type="button"
                variant={"secondary"}
                className="w-full md:w-1/2"
              >
                {t("CANCEL")}
              </Button>
              <Button
                onClick={() => {
                  onSaveEdit();
                }}
                type="button"
                className="w-full md:w-1/2 text-white"
              >
                {t("SAVE")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </HoverCard>
    </Sheet>
  );
};
