"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPermission } from "@prisma/client";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  Icon: LucideIcon;
  userRole: UserPermission | null;
}

export const ShortcutContainerItemPrivateMessageDialog = ({
  Icon,
  title,
  userRole,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-40 text-sm md:text-base md:w-52 h-14 p-2 rounded-lg shadow-sm flex justify-center items-center gap-1 md:gap-2 ${
            userRole !== "OWNER" ? "xl:w-1/5" : "xl:w/14"
          }`}
        >
          <Icon size={16} />
          <h4 className="break-words">{title}</h4>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Placeholder title</DialogTitle>
          <DialogDescription>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, in
            blanditiis aliquid ratione quisquam vero labore aperiam eum dolore
            expedita nobis tempore cupiditate praesentium ipsa et quam molestiae
            aspernatur perspiciatis!
          </DialogDescription>
        </DialogHeader>
        <div></div>
      </DialogContent>
      <DialogFooter>
        <Button type="submit">Button</Button>
      </DialogFooter>
    </Dialog>
  );
};
