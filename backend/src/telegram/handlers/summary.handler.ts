import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../../lib/db";
import { formatIDR } from "../utils";

export async function handleSummary(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });
  if (!user) {
    await bot.sendMessage(chatId, "⚠️ Use /login first.");
    return;
  }

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: { name: "income" },
        date: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: { name: "expense" },
        date: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpense = expense._sum.amount ?? 0;
  const balance = totalIncome - totalExpense;
  const balanceEmoji = balance >= 0 ? "✅" : "⚠️";

  await bot.sendMessage(
    chatId,
    `📊 *This month's summary*\n\n` +
      `💰 Income: ${formatIDR(totalIncome)}\n` +
      `💸 Expense: ${formatIDR(totalExpense)}\n` +
      `${balanceEmoji} Balance: ${formatIDR(balance)}`,
    { parse_mode: "Markdown" },
  );
}
