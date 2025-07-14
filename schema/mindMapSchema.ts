import { z } from "zod";

export const mindMapSchema = z.object({
  mindMapId: z.string(),
  workspaceId: z.string(),
  content: z.any(),
});

export const updateMindMapActiveTagsSchema = z.object({
  workspaceId: z.string(),
  mindMapId: z.string(),
  tagsIds: z.array(z.string()),
});

export const titleAndEmojiSchema = z.object({
  icon: z.string(),
  title: z.string().optional(),
});

export const updateTitleAndEmojiSchema = z.object({
  workspaceId: z.string(),
  mapId: z.string(),
  icon: z.string(),
  title: z.string().optional(),
});

export const deleteMindMapSchema = z.object({
  workspaceId: z.string(),
  mindMapId: z.string(),
});

export type TitleAndEmojiSchema = z.infer<typeof titleAndEmojiSchema>;
export type UpdateTitleAndEmojiSchema = z.infer<
  typeof updateTitleAndEmojiSchema
>;
export type UpdateMindMapActiveTagsSchema = z.infer<
  typeof updateMindMapActiveTagsSchema
>;
export type DeleteMindMapSchema = z.infer<typeof deleteMindMapSchema>;
export type MindMapSchema = z.infer<typeof mindMapSchema>;
