import { config } from '../config.js';

const telegramUrl = () => {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = config;
  return { token, chatId };
};

export const sendLog = (message: string): void => {
  const { token, chatId } = telegramUrl();
  if (!token || !chatId) return;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  }).catch(() => {});
};

export const pingTelegram = async (): Promise<boolean> => {
  const { token, chatId } = telegramUrl();
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: '🏓 pong' }),
    });
    return res.ok;
  } catch {
    return false;
  }
};
