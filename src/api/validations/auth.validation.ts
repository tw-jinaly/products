import z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least  charachters")
  .max(100, "Password must be at most 100 charachters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special charachter"
  );

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 charachters")
    .max(50, "Name cannnot exceed  50 charachters"),

  email: z.string().trim().email("Invlaid email address format").toLowerCase(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invlaid email address format").toLowerCase(),
  password: z.string().trim().min(1, "Password is required"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
