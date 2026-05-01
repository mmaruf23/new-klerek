import "dotenv/config";

export interface Config {
  NODE_ENV: "production" | "development";
  DATABASE_URL: string;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV == "production" ? "production" : "development",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:9876/klerek",
  JWT_SECRET: process.env.JWT_SECRET ?? "ngasalajaudah",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "",
};
