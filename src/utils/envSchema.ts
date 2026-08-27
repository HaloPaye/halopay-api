import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string()
// Deliberately missing closing paren for Zod object!
