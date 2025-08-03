import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().optional().nullable(),
  surname: z.string().optional().nullable(),
  useCase: z
    .string()
    .refine(
      (string) =>
        string === "WORK" || string === "STUDY" || string === "PERSONAL_USE"
    ),
  workspaceName: z
    .string()
    .min(4)
    .refine((username) => /^[a-zA-Z0-9]+$/.test(username)),
  workspaceImage: z.string().optional().nullable(),
  
  // External service usernames
  leetcodeUsername: z.string().optional().nullable(),
  codeforcesUsername: z.string().optional().nullable(),
  redditUsername: z.string().optional().nullable(),
  githubUsername: z.string().optional().nullable(),
  emailIds: z.array(z.string().email()).optional().default([]),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
