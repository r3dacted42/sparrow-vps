import dotenv from "dotenv";

dotenv.config();
import {GithubEnv} from "../helper/types"

const requiredEnvVars = [
  "SUPABASE_DB_URL",
  "SUPABASE_API_KEY",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
] as const;

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

export const PORT: string | undefined = process.env.PORT;
export const REDIRECT_URL: string | undefined = process.env.REDIRECT_URL;

export const GITHUB: GithubEnv = {
  CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
};