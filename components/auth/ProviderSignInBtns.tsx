import { AppleLogo } from "../svg/AppleLogo";
import { GithubLogo } from "../svg/GithubLogo";
import { GoogleLogo } from "../svg/GoogleLogo";
import { ProviderSignInBtn } from "./ProviderSignInBtn";
import { useTranslations } from "next-intl";

export const ProviderSignInBtns = ({
  signInCard,
  disabled,
  onLoading,
}: {
  signInCard?: boolean;
  disabled?: boolean;
  onLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const t = useTranslations("AUTH");
  return (
    <div className="grid grid-cols-1 gap-2">
      <ProviderSignInBtn
        disabled={disabled}
        onLoading={onLoading}
        providerName="google"
        className="w-full h-10 bg-background border border-border/40 hover:border-primary/40 hover:bg-muted/50 rounded-xl text-sm font-medium transition-all duration-200 group"
      >
        <GoogleLogo className="mr-2 group-hover:scale-110 transition-transform duration-200" width={18} height={18} />
        <span className="flex-1 text-left">
          {signInCard
            ? t("SIGN_IN.PROVIDERS.GOOGLE")
            : t("SIGN_UP.PROVIDERS.GOOGLE")}
        </span>
      </ProviderSignInBtn>
      
      <ProviderSignInBtn
        disabled={disabled}
        onLoading={onLoading}
        providerName="github"
        className="w-full h-10 bg-background border border-border/40 hover:border-primary/40 hover:bg-muted/50 rounded-xl text-sm font-medium transition-all duration-200 group"
      >
        <GithubLogo className="fill-foreground mr-2 group-hover:scale-110 transition-transform duration-200" width={18} height={18} />
        <span className="flex-1 text-left">
          {signInCard
            ? t("SIGN_IN.PROVIDERS.GITHUB")
            : t("SIGN_UP.PROVIDERS.GITHUB")}
        </span>
      </ProviderSignInBtn>

      {/* Optional Apple Sign In */}
      {/* <ProviderSignInBtn
        disabled={disabled}
        onLoading={onLoading}
        providerName="apple"
        className="w-full h-10 bg-black/90 hover:bg-black/80 dark:bg-black/70 dark:hover:bg-black/60 text-white rounded-xl text-sm font-medium transition-all duration-200 group"
      >
        <AppleLogo className="fill-white mr-2 group-hover:scale-110 transition-transform duration-200" width={18} height={18} />
        <span className="flex-1 text-left">
          {signInCard
            ? t("SIGN_IN.PROVIDERS.APPLE")
            : t("SIGN_UP.PROVIDERS.APPLE")}
        </span>
      </ProviderSignInBtn> */}
    </div>
  );
};
