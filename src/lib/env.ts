import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_MODEL: z.string().optional().default("openai/gpt-4o-mini"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const _env = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!_env.success) {
  // A missing/misconfigured variable must never take down a route with an
  // opaque HTML 500. Log the offending field names (not their values) and fall
  // back to process.env so routes keep loading and surface a readable error.
  console.error("❌ Invalid environment variables:");
  // Do not log the actual invalid values, just the field names and errors
  for (const error of _env.error.issues) {
    console.error(`  - ${error.path.join(".")}: ${error.message}`);
  }
}

export const env = _env.success
  ? _env.data
  : {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") ?? "development",
    };
