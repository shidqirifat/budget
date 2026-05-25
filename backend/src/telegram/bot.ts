import TelegramBot from "node-telegram-bot-api";
import { handleStart } from "./handlers/start.handler";
import { handleLogin, handleLogout } from "./handlers/login.handler";
import { handleCategories } from "./handlers/categories.handler";
import { handleSummary } from "./handlers/summary.handler";
import { handleToday } from "./handlers/today.handler";
import { handleUndo, handleUndoCallbackQuery } from "./handlers/undo.handler";
import { handleMessage } from "./handlers/transaction.handler";

export function startTelegramBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot started.");

  bot.onText(/^\/start$/, (msg) => handleStart(msg, bot));
  bot.onText(/^\/login$/, (msg) => handleLogin(msg, bot));
  bot.onText(/^\/logout$/, (msg) => handleLogout(msg, bot));
  bot.onText(/^\/categories$/, (msg) => handleCategories(msg, bot));
  bot.onText(/^\/summary$/, (msg) => handleSummary(msg, bot));
  bot.onText(/^\/today$/, (msg) => handleToday(msg, bot));
  bot.onText(/^\/undo$/, (msg) => handleUndo(msg, bot));

  bot.on("callback_query", (query) => handleUndoCallbackQuery(query, bot));
  bot.on("message", (msg) => handleMessage(msg, bot));

  bot.on("polling_error", (err) => {
    console.error("Telegram polling error:", err.message);
  });
}
