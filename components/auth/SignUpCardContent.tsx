"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { signUpSchema, SignUpSchema } from "@/schema/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProviderSignInBtns } from "./ProviderSignInBtns";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoadingState } from "../ui/loadingState";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { userService } from "@/lib/userService";

export const SignUpCardContent = () => {
  const t = useTranslations("AUTH");
  const m = useTranslations("MESSAGES");
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: SignUpSchema) => {
    setIsLoading(true);

    try {
      // Use the user service API client
      const response = await userService.register({
        email: data.email,
        password: data.password,
        username: data.username,
      });

      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }

      toast({
        title: m("SUCCESS.SIGN_UP"),
      });
      
      // Auto-login after successful registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/onboarding");
    } catch (err) {
      let errMsg = m("ERRORS.DEFAULT");
      if (typeof err === "string") {
        errMsg = err;
      } else if (err instanceof Error) {
        errMsg = m(err.message);
      }
      toast({
        title: errMsg,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Provider Sign In */}
          <div className="space-y-3">
            <ProviderSignInBtns disabled={isLoading} onLoading={setIsLoading} />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  Or create your account
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      <Input 
                        placeholder={t("EMAIL")} 
                        className="pl-10 h-10 bg-muted/30 border-border/40 focus:border-primary/60 focus:bg-background/80 transition-all duration-200 rounded-xl"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      <Input 
                        placeholder={t("USERNAME")} 
                        className="pl-10 h-10 bg-muted/30 border-border/40 focus:border-primary/60 focus:bg-background/80 transition-all duration-200 rounded-xl"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("PASSWORD")}
                        className="pl-10 pr-10 h-10 bg-muted/30 border-border/40 focus:border-primary/60 focus:bg-background/80 transition-all duration-200 rounded-xl"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            disabled={isLoading}
            className="w-full h-10 font-semibold text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            type="submit"
          >
            {isLoading ? (
              <LoadingState loadingText={m("PENDING.LOADING")} />
            ) : (
              <>
                {t("SIGN_UP.SUBMIT_BTN")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </Button>

          {/* Terms & Privacy - More Compact */}
          <div className="bg-muted/20 border border-border/20 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("SIGN_UP.TERMS.FIRST")}{" "}
                <span className="font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer underline-offset-2 hover:underline">
                  {t("SIGN_UP.TERMS.SECOND")}
                </span>
                {" "}and{" "}
                <span className="font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer underline-offset-2 hover:underline">
                  Privacy Policy
                </span>
                . Your data is secure with us.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
