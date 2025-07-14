import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useTranslations } from "next-intl";

export const useProviderLoginError = (showLoggedInfo: boolean) => {
  const params = useSearchParams();
  const session = useSession();
  const { toast } = useToast();
  const m = useTranslations("MESSAGES");
  const router = useRouter();
  useEffect(() => {
    const error = params.get("error");
    if (error && session.status === "unauthenticated") {
      switch (error) {
        case "OAuthAccountNotLinked":
          toast({
            title: m("ERRORS.TAKEN_EMAIL"),
            variant: "destructive",
          });
          break;
        case "OAuthCreateAccount":
          toast({
            title: m("ERRORS.TAKEN_USERNAME"),
            variant: "destructive",
          });
          break;
        case "Callback":
          toast({
            title: m("ERRORS.DEFAULT"),
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: m("ERRORS.DEFAULT"),
            variant: "destructive",
          });
      }

      const timer = setTimeout(() => {
        router.replace("/sign-in");
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
    if (session.status === "authenticated" && showLoggedInfo) {
      toast({
        title: m("SUCCESS.SIGN_IN"),
      });
    }
  }, [params, toast, session, router, m, showLoggedInfo]);
};
