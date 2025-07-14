"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { colors } from "@/lib/getRandomWorkspaceColor";
import { tagSchema, TagSchema } from "@/schema/tagSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomColors, Tag } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { v4 as uuidv4 } from "uuid";

interface Props {
  onSetTab: (tab: "list" | "newTag" | "editTag") => void;
  workspaceId: string;
  edit?: boolean;
  tagName?: string;
  color?: CustomColors;
  id?: string;
  onUpdateActiveTags?: (
    tagId: string,
    color: CustomColors,
    name: string
  ) => void;
  currentActiveTags?: Tag[];
  onDeleteActiveTag?: (tagId: string) => void;
  onSelectActiveTag?: (id: string) => void;
}

export const CreateNewTagOrEditTag = ({
  onSetTab,
  workspaceId,
  edit,
  color,
  id,
  tagName,
  onUpdateActiveTags,
  currentActiveTags,
  onDeleteActiveTag,
  onSelectActiveTag,
}: Props) => {
  const form = useForm<TagSchema>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tagName: edit && tagName ? tagName : "",
      color: edit && color ? color : "RED",
      id: edit && id ? id : uuidv4(),
    },
  });
  const queryClient = useQueryClient();

  const tagColor = (providedColor: CustomColors) => {
    switch (providedColor) {
      case CustomColors.BLUE:
        return "bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500";
      case CustomColors.EMERALD:
        return "bg-emerald-600 hover:bg-emerald-500 border-emerald-600 hover:border-emerald-500";
      case CustomColors.LIME:
        return "bg-lime-600 hover:bg-lime-500 border-lime-600 hover:border-lime-500";
      case CustomColors.ORANGE:
        return "bg-orange-600 hover:bg-orange-500 border-orange-600 hover:border-orange-500";
      case CustomColors.PINK:
        return "bg-pink-600 hover:bg-pink-500 border-pink-600 hover:border-pink-500";
      case CustomColors.YELLOW:
        return "bg-yellow-600 hover:bg-yellow-500 border-yellow-600 hover:border-yellow-500";
      case CustomColors.RED:
        return "bg-red-600 hover:bg-red-500 border-red-600 hover:border-red-500";
      case CustomColors.PURPLE:
        return "bg-purple-600 hover:bg-purple-500 border-purple-600 hover:border-purple-500";
      case CustomColors.GREEN:
        return "bg-green-600 hover:bg-green-500 border-green-600 hover:border-green-500";
      case CustomColors.CYAN:
        return "bg-cyan-600 hover:bg-cyan-500 border-cyan-600 hover:border-cyan-500";
      case CustomColors.INDIGO:
        return "bg-indigo-600 hover:bg-indigo-500 border-indigo-600 hover:border-indigo-500";
      case CustomColors.FUCHSIA:
        return "bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500";
      default:
        return "bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500";
    }
  };

  const { toast } = useToast();
  const m = useTranslations("MESSAGES");
  const t = useTranslations("TASK.HEADER.TAG");

  const { mutate: newTag } = useMutation({
    mutationFn: async (data: TagSchema) => {
      await axios.post("/api/tags/new_tag", {
        ...data,
        workspaceId,
      });
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getWorkspaceTags"]);
      const previousTags = queryClient.getQueryData<Tag[]>([
        "getWorkspaceTags",
      ]);

      const checkedPreviousTags =
        previousTags && previousTags.length > 0 ? previousTags : [];

      const id = form.getValues("id");
      const name = form.getValues("tagName");
      const color = form.getValues("color");

      queryClient.setQueryData(
        ["getWorkspaceTags"],
        [...checkedPreviousTags, { id, name, color, workspaceId }]
      );
      onSetTab("list");

      return { checkedPreviousTags };
    },
    onError: (err: AxiosError, _, context) => {
      //@ts-ignore
      queryClient.setQueriesData(
        ["getWorkspaceTags"] as any,
        context?.checkedPreviousTags
      );
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getWorkspaceTags"]);
    },
    onSuccess: () => {
      toast({
        title: m("SUCCESS.UPDATED_WORKSPACE"),
      });
    },
    mutationKey: ["newTag"],
  });

  const { mutate: editTag } = useMutation({
    mutationFn: async (data: TagSchema) => {
      await axios.post("/api/tags/edit_tag", {
        ...data,
        workspaceId,
      });
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getWorkspaceTags"]);
      const previousTags = queryClient.getQueryData<Tag[]>([
        "getWorkspaceTags",
      ]);

      const checkedPreviousTags =
        previousTags && previousTags.length > 0 ? previousTags : [];

      const name = form.getValues("tagName");
      const color = form.getValues("color");

      const updatedTags = checkedPreviousTags.map((tag) =>
        tag.id === id ? { ...tag, name, color } : tag
      );

      queryClient.setQueryData(["getWorkspaceTags"], updatedTags);
      onUpdateActiveTags && onUpdateActiveTags(id!, color, name);
      onSetTab("list");

      return { checkedPreviousTags };
    },
    onError: (err: AxiosError, _, context) => {
      //@ts-ignore
      const prevTag = context?.checkedPreviousTags.find((tag) => tag.id === id);
      queryClient.setQueryData(
        ["getWorkspaceTags"],
        context?.checkedPreviousTags
      );
      onUpdateActiveTags &&
        onUpdateActiveTags(id!, prevTag?.color!, prevTag?.name!);
      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getWorkspaceTags"]);
    },
    mutationKey: ["editTag"],
  });

  const { mutate: deleteTag } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/tags/delete_tag", {
        id,
        workspaceId,
      });
    },
    onMutate: async () => {
      //@ts-ignore
      await queryClient.cancelQueries(["getWorkspaceTags"]);
      const previousTags = queryClient.getQueryData<Tag[]>([
        "getWorkspaceTags",
      ]);

      const checkedPreviousTags =
        previousTags && previousTags.length > 0 ? previousTags : [];
      const previousActiveTags = currentActiveTags ? currentActiveTags : [];

      const updatedTags = checkedPreviousTags.filter((tag) => tag.id !== id);

      queryClient.setQueryData(["getWorkspaceTags"], updatedTags);
      onDeleteActiveTag && onDeleteActiveTag(id!);
      onSetTab("list");

      return { checkedPreviousTags, previousActiveTags };
    },
    onError: (err: AxiosError, _, context) => {
      //@ts-ignore

      const previousActiveTag = context?.previousActiveTags.find(
        (tag) => tag.id === id
      );
      queryClient.setQueryData(
        ["getWorkspaceTags"],
        context?.checkedPreviousTags
      );
      previousActiveTag &&
        onSelectActiveTag &&
        onSelectActiveTag(previousActiveTag.id);

      const error = err?.response?.data ? err.response.data : "ERRORS.DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSettled: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getWorkspaceTags"]);
    },
    mutationKey: ["deleteTag"],
  });

  const onSubmit = async (data: TagSchema) => {
    edit ? editTag(data) : newTag(data);
  };

  return (
    <Form {...form}>
      <form className="w-full max-w-[15rem] p-3 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="tagName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="bg-muted h-7 py-1.5 text-sm"
                      placeholder={t("TAG_NAME")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-muted-foreground">
                    {t("COLORS")}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-2 md:gap-3"
                    >
                      {colors.map((color) => (
                        <FormItem
                          key={color}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={color}
                              //@ts-ignore
                              useCheckIcon
                              className={`transition-colors duration-200 ${tagColor(
                                color
                              )}`}
                            ></RadioGroupItem>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              edit ? deleteTag() : onSetTab("list");
            }}
            type="button"
            className="w-1/2 h-fit py-1.5"
            variant={"secondary"}
            size={"sm"}
          >
            {edit ? t("BTNS.DELETE") : t("BTNS.CANCEL")}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            size={"sm"}
            type="submit"
            className="w-1/2 h-fit py-1.5 dark:text-white"
          >
            {edit ? t("BTNS.UPDATE") : t("BTNS.CREATE")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
