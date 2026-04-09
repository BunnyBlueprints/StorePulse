import { z } from 'zod';

export const userSignupSchema = z.object({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email format"),
  address: z.string().max(400, "Address cannot exceed 400 characters"),
  password: z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/, "Password must include at least one uppercase letter and one special character"),
});

export const userCreateSchema = userSignupSchema.extend({
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const passwordUpdateSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8).max(16).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).+$/, "Password must include at least one uppercase letter and one special character"),
});

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  address: z.string().max(400),
});

export const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  storeId: z.string().uuid(),
});
