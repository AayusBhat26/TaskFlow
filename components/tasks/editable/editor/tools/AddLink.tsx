"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { linkSchema, LinkSchema } from "@/schema/linkSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@tiptap/react";
import { Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { OptionBtn } from "./btn/OptionBtn";

interface Props {
  editor: Editor | null;
}

export const AddLink = ({ editor }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<LinkSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      link: "",
    },
  });
  const t = useTranslations("TASK.EDITOR.HOVER");

  const removeLink = useCallback(() => {
    if (editor)
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsOpen(false);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    form.setValue("link", previousUrl ? previousUrl : "");
  }, [editor, form]);

  const saveLink = useCallback(() => {
    (data: LinkSchema) => {
      const { link } = data;
      if (editor)
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: link })
          .run();
      setIsOpen(false);
    };
  }, [editor]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <OptionBtn onClick={setLink} hoverText={t("LINK")}>
          <Link2 size={16} />
        </OptionBtn>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert link</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6 my-4">
            <div className="space-y-1.5">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="bg-muted"
                        placeholder="link"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end w-full items-center gap-2">
              <Button
                variant={"secondary"}
                type="button"
                onClick={removeLink}
                disabled={!!!editor?.getAttributes("link").href}
              >
                Remove link
              </Button>
              <Button
                type="button"
                className="text-white"
                onClick={() => {
                  form.handleSubmit(saveLink)();
                }}
              >
                Add link
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
