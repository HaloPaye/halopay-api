import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string()
});
