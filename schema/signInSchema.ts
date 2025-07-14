import { z } from "zod";

export const password = z
  .string()
  .refine((password) => password.length >= 6, {
    message: "SCHEMA.PASSWORD.MIN",
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: "SCHEMA.PASSWORD.UPPERCASE",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "SCHEMA.PASSWORD.LOWERCASE",
  })
  .refine((password) => /\d/.test(password), {
    message: "SCHEMA.PASSWORD.DIGIT",
  });

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export type SignInSchema = z.infer<typeof signInSchema>;
