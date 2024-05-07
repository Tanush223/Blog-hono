import { string, z } from "zod";

export const signupZodSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const signinZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createZodSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateZodSchema = z.object({
  title: string(),
  content: string(),
  id: string(),
});

export type SignupZodSchema = z.infer<typeof signupZodSchema>;
export type SigninZodSchema = z.infer<typeof signinZodSchema>;
export type CreateZodSchema = z.infer<typeof createZodSchema>;
export type UpdateZodSchema = z.infer<typeof updateZodSchema>;
