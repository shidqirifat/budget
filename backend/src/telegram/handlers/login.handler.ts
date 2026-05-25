import TelegramBot from "node-telegram-bot-api";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/db";
import { getCategoryListText } from "../category-mapper";

export type LoginState =
  | { step: "await_email" }
  | { step: "await_password"; email: string };

export const loginSessions = new Map<number, LoginState>();

export async function handleLoginStep(
  bot: TelegramBot,
  chatId: number,
  text: string,
): Promise<boolean> {
  const state = loginSessions.get(chatId);
  if (!state) return false;

  if (state.step === "await_email") {
    const email = text.trim().toLowerCase();
    loginSessions.set(chatId, { step: "await_password", email });
    await bot.sendMessage(chatId, "🔑 Got it. Now send your password:");
    return true;
  }

  if (state.step === "await_password") {
    loginSessions.delete(chatId);
    const { email } = state;
    const password = text.trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await bot.sendMessage(
        chatId,
        "❌ No account found with that email. Try /login again.",
      );
      return true;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await bot.sendMessage(chatId, "❌ Wrong password. Try /login again.");
      return true;
    }

    if (user.telegramChatId && user.telegramChatId !== String(chatId)) {
      await bot.sendMessage(
        chatId,
        "⚠️ This account is already linked to a different Telegram chat. Use /unlink there first, or continue — it will be re-linked here.",
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: String(chatId) },
    });

    const expenseCategories = await getCategoryListText("expense", user.id);
    const incomeCategories = await getCategoryListText("income", user.id);

    await bot.sendMessage(
      chatId,
      `✅ Logged in! Hi ${user.name ?? user.email}!\n\n` +
        `Your expense categories:\n${expenseCategories}\n\n` +
        `Your income categories:\n${incomeCategories}\n\n` +
        `Just send me a message like:\n` +
        `• "Lunch 50rb"\n` +
        `• "Gojek kemarin 25k"\n` +
        `• "Belanja supermarket 150k"\n` +
        `• "Gaji 5jt"\n\n` +
        `Use /summary to see this month's balance.`,
    );
    return true;
  }

  return false;
}

export async function handleLogin(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  loginSessions.set(chatId, { step: "await_email" });
  await bot.sendMessage(chatId, "📧 Please send your account email:");
}

export async function handleLogout(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  loginSessions.delete(chatId);
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });
  if (!user) {
    await bot.sendMessage(chatId, "⚠️ No linked account found.");
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null },
  });
  await bot.sendMessage(chatId, "✅ Logged out. Use /login to connect again.");
}
