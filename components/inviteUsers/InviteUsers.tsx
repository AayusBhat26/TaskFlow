import { Workspace } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus2 } from "lucide-react";
import { InviteContent } from "./InviteContent";
import { useTranslations } from "next-intl";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface Props {
  workspace: Workspace;
}

export const InviteUsers = ({ workspace }: Props) => {
  const t = useTranslations("INVITE");
  return (
    <Dialog>
      <HoverCard openDelay={250} closeDelay={250}>
        <HoverCardTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size={"icon"}
              className="text-primary sm:bg-primary/10 sm:text-primary sm:font-semibold sm:hover:bg-primary sm:hover:text-white sm:h-9 sm:rounded-md sm:px-3 sm:w-auto sm:space-x-2"
              variant={"ghost"}
            >
              <span className="hidden sm:inline">{t("INVITE")}</span>
              <UserPlus2 size={18} />
            </Button>
          </DialogTrigger>
        </HoverCardTrigger>
        <HoverCardContent align="center">
          <span>{t("HINT")}</span>
        </HoverCardContent>
      </HoverCard>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span>{t("TITLE")}</span> <span>{workspace.name}</span>
          </DialogTitle>
          <DialogDescription>{t("DESC")}</DialogDescription>
        </DialogHeader>
        <InviteContent workspace={workspace} />
      </DialogContent>
    </Dialog>
  );
};
