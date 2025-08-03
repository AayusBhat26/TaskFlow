"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { externalServicesSchema, ExternalServicesSchema } from "@/schema/externalServicesSchema";
import { Github, Code, MessageCircle, Mail, Plus, X, Save, RefreshCw } from "lucide-react";

interface Props {
  initialData: {
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
    redditUsername?: string | null;
    githubUsername?: string | null;
    emailIds?: string[];
  };
}

export const ExternalServicesSettings = ({ initialData }: Props) => {
  const { toast } = useToast();
  
  const form = useForm<ExternalServicesSchema>({
    resolver: zodResolver(externalServicesSchema),
    defaultValues: {
      leetcodeUsername: initialData.leetcodeUsername || "",
      codeforcesUsername: initialData.codeforcesUsername || "",
      redditUsername: initialData.redditUsername || "",
      githubUsername: initialData.githubUsername || "",
      emailIds: initialData.emailIds || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailIds"
  });

  const { mutate: updateExternalServices, isPending } = useMutation({
    mutationFn: async (data: ExternalServicesSchema) => {
      const response = await axios.post("/api/profile/external-services", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "External services updated",
        description: "Your external service accounts have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update external services. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExternalServicesSchema) => {
    updateExternalServices(data);
  };

  const addEmailField = () => {
    append("");
  };

  const removeEmailField = (index: number) => {
    remove(index);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          External Service Integrations
        </CardTitle>
        <CardDescription>
          Connect your external accounts to track your progress and get personalized insights across platforms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Coding Platforms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <Code className="w-5 h-5" />
                Coding Platforms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="leetcodeUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        LeetCode Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. alice_coder"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Your LeetCode username for contest rating and problem statistics
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="codeforcesUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        Codeforces Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. tourist"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Codeforces handle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Social Platforms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <MessageCircle className="w-5 h-5" />
                Social Platforms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="githubUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. octocat"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Your GitHub username
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redditUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                        Reddit Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. username (without u/)"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Reddit username (without u/ prefix)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Email Tracking */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <Mail className="w-5 h-5" />
                Email Tracking
              </h3>
              <FormDescription>
                Add email addresses you'd like to monitor for new messages. This will help you stay updated with important emails directly in your dashboard.
              </FormDescription>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`emailIds.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="email@example.com"
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
                  Add Email Address
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
