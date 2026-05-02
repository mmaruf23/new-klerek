import { config } from "../config.js";

const telegramUrl = () => {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = config;
  return { token, chatId };
};

export const sendLog = async (message: string): Promise<void> => {
  if (config.NODE_ENV !== "production") {
    console.log("This is Telegram Log (production) : ", message);
    return;
  }

  const { token, chatId } = telegramUrl();
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  }).catch(() => {
    console.log("Failed to send log to Telegram:", message);
  });
};

export const pingTelegram = async (): Promise<boolean> => {
  const { token, chatId } = telegramUrl();
  if (!token || !chatId) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: "🏓 pong" }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
};
