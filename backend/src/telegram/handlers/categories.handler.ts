import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../../lib/db";
import { getCategoryListText } from "../category-mapper";

export async function handleCategories(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });
  if (!user) {
    await bot.sendMessage(chatId, "⚠️ Use /login first.");
    return;
  }
  const [expCats, incCats] = await Promise.all([
    getCategoryListText("expense", user.id),
    getCategoryListText("income", user.id),
  ]);
  await bot.sendMessage(
    chatId,
    `🏷️ *Your categories*\n\n*Expense:*\n${expCats}\n\n*Income:*\n${incCats}`,
    { parse_mode: "Markdown" },
  );
}
