"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const BackBtn = () => {
  const router = useRouter();
  const t = useTranslations("COMMON");

  return (
    <Button
      onClick={() => {
        router.back();
        router.refresh();
      }}
      className="gap-1 flex justify-center items-center"
      variant={"secondary"}
      size={"sm"}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:inline-block">{t("BACK_BTN")}</span>
    </Button>
  );
};
