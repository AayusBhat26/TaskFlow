"use client";

import { UploadFile } from "@/components/onboarding/common/UploadFile";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { imageLinkSchema, ImageLinkSchema } from "@/schema/linkSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { useState } from "react";

interface Props {
  onAddImage: (link: string) => void;
}

export const AddImageByImport = ({ onAddImage }: Props) => {
  const t = useTranslations("TASK.EDITOR.IMAGE.UPLOAD_TAB");
  const m = useTranslations("MESSAGES");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      toast({
        title: m("ERRORS.IMAGE_TO_EDITOR"),
        variant: "destructive",
      });
    },
    onClientUploadComplete: (data) => {
      if (!data)
        toast({
          title: m("ERRORS.IMAGE_PROFILE_UPDATE"),
          variant: "destructive",
        });
      else {
        onAddImage(data[0].url);
      }
    },
  });

  const form = useForm<ImageLinkSchema>({
    resolver: zodResolver(imageLinkSchema),
  });

  const addImageByImportHandler = async (data: ImageLinkSchema) => {
    const image: File = data.file;
    await startUpload([image]);
  };

  return (
    <Form {...form}>
      <form>
        <UploadFile
          ContainerClassName="w-full"
          LabelClassName="text-muted-foreground mb-1.5 self-start"
          typesDescription={t("TYPES")}
          form={form}
          schema={imageLinkSchema}
          inputAccept="image/*"
        />
        <div className="flex justify-end w-full items-center gap-2">
          <Button
            disabled={isLoading}
            className="text-white"
            onClick={() => {
              form.handleSubmit(addImageByImportHandler)();
            }}
          >
            {isLoading ? (
              <LoadingState loadingText={t("BTN_PENDING")} />
            ) : (
              t("BTN_ADD")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
