import "dotenv/config";

export interface Config {
  NODE_ENV: "production" | "development";
  DATABASE_URL: string;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  CORS_ORIGIN: string;
  WIJAYAPAY_MERCHANT_ID: string;
  WIJAYAPAY_API_KEY: string;
  WIJAYAPAY_BASE_URL: string;
  WIJAYAPAY_CALLBACK_URL: string;
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV == "production" ? "production" : "development",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:9876/klerek",
  JWT_SECRET: process.env.JWT_SECRET ?? "ngasalajaudah",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID ?? "",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  WIJAYAPAY_MERCHANT_ID: process.env.WIJAYAPAY_MERCHANT_ID ?? "",
  WIJAYAPAY_API_KEY: process.env.WIJAYAPAY_API_KEY ?? "",
  WIJAYAPAY_BASE_URL: process.env.WIJAYAPAY_BASE_URL ?? "https://wijayapay.id/api",
  WIJAYAPAY_CALLBACK_URL: process.env.WIJAYAPAY_CALLBACK_URL ?? "",
};
