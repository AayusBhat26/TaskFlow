"use client";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { useOnboardingForm } from "@/context/OnboardingForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Finish = () => {
  const t = useTranslations("ONBOARDING_FORM");
  const { 
    workspaceName, 
    workspaceImage, 
    surname, 
    useCase, 
    name,
    leetcodeUsername,
    codeforcesUsername,
    redditUsername,
    githubUsername,
    emailIds
  } = useOnboardingForm();
  const { toast } = useToast();
  const m = useTranslations("MESSAGES");
  const { update } = useSession();
  const router = useRouter();
  const [isDone, setIsDone] = useState(false);

  const { mutate: completeOnboarding, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/onboarding", {
        name,
        surname,
        useCase,
        workspaceImage,
        workspaceName,
        leetcodeUsername,
        codeforcesUsername,
        redditUsername,
        githubUsername,
        emailIds,
      });
      return data;
    },
    onError: (err: AxiosError) => {
      const error = err?.response?.data ? err.response.data : "ERRORS_DEFAULT";

      toast({
        title: m(error),
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      setIsDone(true);
      toast({
        title: m("SUCCESS.ONBOARDING_COMPLETE"),
      });
      await update();
      router.push("/dashboard");
      router.refresh();
    },
    mutationKey: ["completeOnboarding"],
  });

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4 w-full mt-10 text-center">
        <h2 className="font-bold text-4xl md:text-5xl  max-w-xs">
          {t("FINISH.TITLE")}
        </h2>
      </div>
      <div className="font-bold text-xl sm:text-2xl md:text-3xl w-full max-w-lg text-center">
        <p>
          {t("FINISH.DESC_FIRST")}{" "}
          <span>
            <span className="text-primary font-semibold">TaskFlow</span>
          </span>
          {t("FINISH.DESC_SECOND")}{" "}
        </p>
        <Button
          disabled={isPending || isDone}
          onClick={() => completeOnboarding()}
          type="submit"
          className="mt-10 sm:mt-32 w-full max-w-md dark:text-white font-semibold"
        >
          {isPending || isDone ? (
            <LoadingState loadingText={isDone ? t("IS_DONE") : ""} />
          ) : (
            <>{t("START_BTN")}</>
          )}
        </Button>
      </div>
    </>
  );
};
