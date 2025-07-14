"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { HoverCard, HoverCardContent } from "../ui/hover-card";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import Warning from "../ui/warning";
import { useTranslations } from "next-intl";
import { useReactFlow } from "reactflow";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LoadingState } from "../ui/loadingState";

interface Props {
  mindMapId: string;
  workspaceId: string;
}

export const DeleteAllNodes = ({ workspaceId, mindMapId }: Props) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("MIND_MAP.DELETE");
  const { setNodes, getNodes } = useReactFlow();

  const { onSetStatus, status } = useAutosaveIndicator();
  const { toast } = useToast();

  const { mutate: updateMindMap, isPending } = useMutation({
    mutationFn: async () => {
      onSetStatus("pending");
      await axios.post(`/api/mind_maps/update`, {
        content: null,
        mindMapId,
        workspaceId,
      });
    },
    onSuccess: () => {
      onSetStatus("saved");
      setNodes([]);
      toast({
        title: t("MESSAGE.SUCCES"),
      });
      setOpen(false);
    },
    onError: () => {
      onSetStatus("unsaved");
      toast({
        title: t("MESSAGE.ERROR"),
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <HoverCard openDelay={250} closeDelay={250}>
        <DialogTrigger>
          <Button
            disabled={!getNodes().length || status !== "saved"}
            onClick={() => setOpen(true)}
            variant={"ghost"}
            size={"icon"}
          >
            <Trash size={22} />
          </Button>
        </DialogTrigger>
        <HoverCardContent align="start">{t("HOVER")}</HoverCardContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("DIALOG.TITLE")}</DialogTitle>
            <DialogDescription>{t("DIALOG.DESC")}</DialogDescription>
            <Warning>
              <p>{t("DIALOG.WARNING")}</p>
            </Warning>
            <Button
              disabled={isPending}
              onClick={() => updateMindMap()}
              size={"lg"}
              variant={"destructive"}
            >
              {isPending ? (
                <LoadingState loadingText={t("DIALOG.BTN_PENDING")} />
              ) : (
                t("DIALOG.BTN_RESET")
              )}
            </Button>
          </DialogHeader>
        </DialogContent>
      </HoverCard>
    </Dialog>
  );
};
