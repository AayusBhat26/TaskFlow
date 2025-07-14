import { z } from "zod";

export const updateTaskDateSchema = z.object({
  workspaceId: z.string(),
  taskId: z.string(),
  date: z
    .object({
      from: z.string().nullable().optional(),
      to: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const updateTaskContentSchema = z.object({
  workspaceId: z.string(),
  taskId: z.string(),
  content: z.any(),
});

export const updateTaskActiveTagsSchema = z.object({
  workspaceId: z.string(),
  taskId: z.string(),
  tagsIds: z.array(z.string()),
});

export const updateTaskTitleSchema = z.object({
  workspaceId: z.string(),
  taskId: z.string(),
  title: z.string(),
});

export const updateTaskEmojiSchema = z.object({
  workspaceId: z.string(),
  taskId: z.string(),
  selectedEmoji: z.string(),
});

export type UpdateTaskDateSchema = z.infer<typeof updateTaskDateSchema>;
export type UpdateTaskEmojiSchema = z.infer<typeof updateTaskEmojiSchema>;
export type UpdateTaskTitleSchema = z.infer<typeof updateTaskTitleSchema>;
export type UpdateTaskContentSchema = z.infer<typeof updateTaskContentSchema>;
export type UpdateTaskActiveTagsSchema = z.infer<
  typeof updateTaskActiveTagsSchema
>;
