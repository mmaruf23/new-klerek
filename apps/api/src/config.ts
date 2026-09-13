import "dotenv/config";

export interface Config {
  NODE_ENV: "production" | "development";
  DATABASE_URL: string;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  CORS_ORIGIN: string;
  SAWERIA_BASE_URL: string;
  SAWERIA_USER_ID: string;
  COOKIE_TOKEN_KEY: string;
  ACCESS_TOKEN_KEY: string;
  GOOGLE_CLIENT_ID: string;
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV == "production" ? "production" : "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:9876/klerek",
  JWT_SECRET: process.env.JWT_SECRET ?? "ngasalajaudah",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  SAWERIA_BASE_URL: process.env.SAWERIA_BASE_URL ?? "https://backend.saweria.co",
  SAWERIA_USER_ID: process.env.SAWERIA_USER_ID ?? "",
  COOKIE_TOKEN_KEY: "store_token",
  ACCESS_TOKEN_KEY: "access_token",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
};
