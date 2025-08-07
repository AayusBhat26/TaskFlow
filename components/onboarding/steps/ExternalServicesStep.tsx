"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useOnboardingForm } from "@/context/OnboardingForm";
import { externalServicesSchema, ExternalServicesSchema } from "@/schema/externalServicesSchema";

type ExternalServicesFormValues = {
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  redditUsername?: string;
  githubUsername?: string;
  emailIds: string[];
};
import { ActionType } from "@/types/onBoardingContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Plus, X, Github, Code, MessageCircle, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";

interface Props {
  currentStep: number;
}

export const ExternalServicesStep = ({ currentStep }: Props) => {
  const { 
    leetcodeUsername,
    codeforcesUsername, 
    redditUsername, 
    githubUsername,
    emailIds,
    dispatch 
  } = useOnboardingForm();
  
  const [showOptionalMessage, setShowOptionalMessage] = useState(false);

  const form = useForm<ExternalServicesFormValues>({
    resolver: zodResolver(externalServicesSchema),
    defaultValues: {
      leetcodeUsername: leetcodeUsername || "",
      codeforcesUsername: codeforcesUsername || "",
      redditUsername: redditUsername || "",
      githubUsername: githubUsername || "",
      emailIds: emailIds || [],
    },
  });

  // Let TypeScript infer the field array type
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailIds",
  });

  const t = useTranslations("ONBOARDING_FORM");

  const onSubmit = (data: ExternalServicesSchema) => {
    // Store the data in context
    dispatch({ type: ActionType.LEETCODE_USERNAME, payload: data.leetcodeUsername || null });
    dispatch({ type: ActionType.CODEFORCES_USERNAME, payload: data.codeforcesUsername || null });
    dispatch({ type: ActionType.REDDIT_USERNAME, payload: data.redditUsername || null });
    dispatch({ type: ActionType.GITHUB_USERNAME, payload: data.githubUsername || null });
    dispatch({ type: ActionType.EMAIL_IDS, payload: data.emailIds || [] });
    
    // Move to next step
    dispatch({ type: ActionType.CHANGE_SITE, payload: currentStep + 1 });
  };

  const onBack = () => {
    dispatch({ type: ActionType.CHANGE_SITE, payload: currentStep - 1 });
  };

  const onSkip = () => {
    // Skip this step and move to next
    dispatch({ type: ActionType.CHANGE_SITE, payload: currentStep + 1 });
  };

  const addEmailField = () => {
    append("");
  };

  const removeEmailField = (index: number) => {
    remove(index);
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="font-bold text-4xl md:text-5xl mb-4">
          {t("EXTERNAL_SERVICES_STEP.TITLE")}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("EXTERNAL_SERVICES_STEP.DESC")}
          <span className="block text-sm mt-2 text-muted-foreground">
            {t("EXTERNAL_SERVICES_STEP.OPTIONAL_NOTE")}
          </span>
        </p>
      </div>

      <div className="max-w-2xl w-full space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Coding Platforms */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code className="w-5 h-5" />
                {t("EXTERNAL_SERVICES_STEP.CODING_PLATFORMS")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leetcodeUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        {t("EXTERNAL_SERVICES_STEP.INPUTS.LEETCODE")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-muted"
                          placeholder={t("EXTERNAL_SERVICES_STEP.PLACEHOLDERS.LEETCODE")}
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="codeforcesUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        {t("EXTERNAL_SERVICES_STEP.INPUTS.CODEFORCES")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-muted"
                          placeholder={t("EXTERNAL_SERVICES_STEP.PLACEHOLDERS.CODEFORCES")}
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Social Platforms */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t("EXTERNAL_SERVICES_STEP.SOCIAL_PLATFORMS")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="githubUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        {t("EXTERNAL_SERVICES_STEP.INPUTS.GITHUB")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-muted"
                          placeholder={t("EXTERNAL_SERVICES_STEP.PLACEHOLDERS.GITHUB")}
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redditUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                        {t("EXTERNAL_SERVICES_STEP.INPUTS.REDDIT")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-muted"
                          placeholder={t("EXTERNAL_SERVICES_STEP.PLACEHOLDERS.REDDIT")}
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Email Tracking */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t("EXTERNAL_SERVICES_STEP.EMAIL_TRACKING")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("EXTERNAL_SERVICES_STEP.EMAIL_DESC")}
              </p>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`emailIds.${index}` as const}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              className="bg-muted"
                              placeholder={t("EXTERNAL_SERVICES_STEP.PLACEHOLDERS.EMAIL")}
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmailField(index)}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmailField}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("EXTERNAL_SERVICES_STEP.BUTTONS.ADD_EMAIL")}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="sm:w-auto w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex gap-3 flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  className="flex-1"
                >
                  {t("EXTERNAL_SERVICES_STEP.BUTTONS.SKIP")}
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex-1"
                >
                  {t("EXTERNAL_SERVICES_STEP.BUTTONS.CONTINUE")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
