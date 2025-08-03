import { z } from "zod";

export const externalServicesSchema = z.object({
  leetcodeUsername: z.string().optional(),
  codeforcesUsername: z.string().optional(),
  redditUsername: z.string().optional(),
  githubUsername: z.string().optional(),
  emailIds: z.array(z.string().email()).optional(),
});

export type ExternalServicesSchema = z.infer<typeof externalServicesSchema>;
