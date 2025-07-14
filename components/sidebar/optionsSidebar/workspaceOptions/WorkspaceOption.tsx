"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ActiveLink from "@/components/ui/active-link";
import { changeCodeToEmoji } from "@/lib/changeCodeToEmoji";

interface Props {
  workspaceId: string;
  children: React.ReactNode;
  defaultName: string;
  href: string;
  fields: {
    title: string;
    id: string;
    emoji?: string;
  }[];
}

export const WorkspaceOption = ({
  workspaceId,
  children,
  fields,
  href,
  defaultName,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        variant={"ghost"}
        size={"sm"}
        className="w-full justify-between"
        disabled={!fields}
      >
        <div className="flex items-center gap-2">{children}</div>
        <ChevronDown
          className={`transition-all duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>
      <div className="ml-4 text-sm my-1 flex flex-col gap-1">
        {fields &&
          isOpen &&
          fields.map((field, i) => {
            const name =
              field.title && field.title.length > 20
                ? field.title.substring(0, 19) + "..."
                : field.title;

            return (
              <ActiveLink
                key={i}
                href={`/dashboard/workspace/${workspaceId}/${href}/${field.id}`}
                variant={"ghost"}
                size={"sm"}
                className="w-full flex justify-start items-center gap-2 font-normal"
              >
                {field.emoji && <span>{changeCodeToEmoji(field.emoji)}</span>}
                <span>{field.title ? name : defaultName}</span>
              </ActiveLink>
            );
          })}
      </div>
    </div>
  );
};
