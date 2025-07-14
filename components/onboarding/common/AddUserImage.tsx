import Image from "next/image";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Camera, Check, Trash, User } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UserAvatar } from "../../ui/user-avatar";
import { Form, FormControl, FormField, FormItem } from "../../ui/form";
import { useForm } from "react-hook-form";
import { imageSchema, ImageSchema } from "@/schema/imageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../ui/input";
import { useUploadThing } from "@/lib/uploadthing";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { User as UserType } from "@prisma/client";
import { useRouter } from "next-intl/client";
import { useSession } from "next-auth/react";
import { LoadingState } from "../../ui/loadingState";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  profileImage?: string | null;
  className?: string;
}

export const AddUserImage = ({ profileImage, className }: Props) => {
  const [imagePreview, setImagePreview] = useState("");
  const inputRef = useRef<null | HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { update } = useSession();
  const { toast } = useToast();
  const m = useTranslations("MESSAGES");
  const t = useTranslations("CHANGE_PROFILE_IMAGE");

  const form = useForm<ImageSchema>({
    resolver: zodResolver(imageSchema),
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const result = imageSchema.safeParse({ image: selectedFile });
      if (result.success) {
        form.clearErrors("image");
        form.setValue("image", selectedFile);
        setImagePreview(URL.createObjectURL(e.target.files[0]));
      } else {
        const errors = result.error.flatten().fieldErrors.image;
        errors?.forEach((error) => form.setError("image", { message: error }));
      }
    }
  };

  const imageOptions = useMemo(() => {
    if (!imagePreview && profileImage) {
      return {
        canDelete: true,
        canSave: false,
      };
    } else if (imagePreview && profileImage) {
      return {
        canDelete: false,
        canSave: true,
      };
    } else if (imagePreview && !profileImage) {
      return {
        canDelete: false,
        canSave: true,
      };
    } else {
      return {
        canDelete: false,
        canSave: false,
      };
    }
  }, [imagePreview, profileImage]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      toast({
        title: m("ERRORS.UPLOAD_TITLE"),
        variant: "destructive",
      });
    },
    onClientUploadComplete: (data) => {
      if (data) uploadProfileImage(data[0].url);
      else {
        toast({
          title: m("ERRORS.IMAGE_PROFILE_UPDATE"),
          variant: "destructive",
        });
      }
    },
  });

  const { mutate: uploadProfileImage, isPending } = useMutation({
    mutationFn: async (profileImage: string) => {
      const { data } = await axios.post(`/api/profile/profileImage`, {
        profileImage,
      });
      return data as UserType;
    },
    onError: (err) => {
      toast({
        title: m("ERRORS.IMAGE_PROFILE_UPDATE"),
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      toast({
        title: m("SUCCESS.IMAGE_PROFILE_UPDATE"),
      });
      setOpen(false);
      await update();
      router.refresh();
    },
    mutationKey: ["updateProfileImage"],
  });

  const { mutate: deleteProfileImage, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/profile/delete_profile_image`);
      return data as UserType;
    },
    onError: (err) => {
      toast({
        title: m("ERRORS.IMAGE_PROFILE_UPDATE"),
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      toast({
        title: m("SUCCESS.IMAGE_PROFILE_UPDATE"),
      });
      await update();
      router.refresh();
    },
    mutationKey: ["deleteProfileImage"],
  });

  const onSubmit = async (data: ImageSchema) => {
    const image: File = data.image;
    await startUpload([image]);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      <p className="text-sm text-muted-foreground">Add a photo</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className={cn(
              "group relative bg-muted w-16 h-16 md:h-20 md:w-20 rounded-full flex justify-center items-center text-muted-foreground overflow-hidden",
              className
            )}
          >
            {profileImage ? (
              <Image
                priority
                src={profileImage}
                alt=""
                fill
                className="object-cover w-full h-full"
              />
            ) : (
              <User />
            )}
            <div className="group-hover:opacity-80 transition-opacity duration-200 opacity-0 w-full h-full absolute bg-black flex justify-center items-center flex-col gap-1 text-xs text-white">
              <Camera size={20} />
              <p>{t("HOVER")}</p>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex flex-col items-center justify-center sm:max-w-[28rem] p-0">
          <DialogHeader className="items-center justify-center">
            <DialogTitle>Upload a photo</DialogTitle>
          </DialogHeader>
          {imagePreview ? (
            <div className="rounded-full w-32 h-32 sm:w-52 sm:h-52 relative overflow-hidden my-5">
              <Image
                src={imagePreview}
                alt=""
                fill
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <UserAvatar
              className="w-32 h-32 sm:w-52 sm:h-52 my-5"
              size={52}
              profileImage={profileImage}
            />
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center items-center">
                        <Button
                          onClick={() => {
                            inputRef.current?.click();
                          }}
                          type="button"
                          className="dark:text-white mb-1"
                        >
                          Choose a file
                        </Button>
                        <Input
                          {...field}
                          ref={inputRef}
                          value={undefined}
                          onChange={onImageChange}
                          type="file"
                          id="image"
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              ></FormField>

              <div className="flex mt-5 w-full justify-center items-center gap-4">
                <Button
                  type="button"
                  disabled={!imageOptions.canDelete || isDeleting}
                  variant={imageOptions.canDelete ? "default" : "secondary"}
                  className={`rounded-full w-12 h-12 p-2 ${
                    imageOptions.canDelete
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => deleteProfileImage()}
                >
                  {isDeleting ? <LoadingState /> : <Trash size={18} />}
                </Button>
                <Button
                  type="submit"
                  disabled={!imageOptions.canSave || isUploading || isPending}
                  variant={imageOptions.canSave ? "default" : "secondary"}
                  className={`rounded-full w-12 h-12 p-2 ${
                    imageOptions.canSave
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  {isPending || isUploading ? (
                    <LoadingState />
                  ) : (
                    <Check size={18} />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
