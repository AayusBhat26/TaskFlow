"use client";

import { StarredItem } from "@/types/saved";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";
import { useRouter } from "next-intl/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTranslations } from "next-intl";

interface Props {
  sortType: string | null;
  refetch: <TPageData>(
    //@ts-ignore
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<StarredItem[], unknown>>;
}

export const SortSelect = ({ sortType, refetch }: Props) => {
  const t = useTranslations("STARRED");
  const router = useRouter();
  const onSelectHandler = (type: "asc" | "desc") => {
    router.push(`/dashboard/starred/?sort=${type}`);
    refetch();
  };

  return (
    <div>
      <Select
        defaultValue={
          sortType === "asc" || sortType === "desc" ? sortType : "desc"
        }
        onValueChange={(field) => {
          onSelectHandler(field as "asc" | "desc");
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">{t("SORT.ASC")}</SelectItem>
          <SelectItem value="desc">{t("SORT.DESC")}</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground mt-1">{t("SORT.INFO")}</p>
    </div>
  );
};
