import { z } from "zod";

export const deleteAccountSchema = z.object({
  email: z.string().email("SCHEMA.EMAIL"),
});

export type DeleteAccountSchema = z.infer<typeof deleteAccountSchema>;
