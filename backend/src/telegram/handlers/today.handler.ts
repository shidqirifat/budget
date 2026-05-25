import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../../lib/db";
import { formatIDR, getTodayDate } from "../utils";

export async function handleToday(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });
  if (!user) {
    await bot.sendMessage(chatId, "⚠️ Use /login first.");
    return;
  }

  const now = new Date();
  const from = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
  );
  const to = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
  );

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: from, lte: to } },
    include: { type: true, category: true, subCategory: true },
    orderBy: { date: "asc" },
  });

  if (transactions.length === 0) {
    await bot.sendMessage(chatId, "📭 No transactions recorded today.");
    return;
  }

  let totalIncome = 0;
  let totalExpense = 0;
  const lines = transactions.map((tx) => {
    const isIncome = tx.type.name === "income";
    if (isIncome) totalIncome += tx.amount;
    else totalExpense += tx.amount;
    const emoji = isIncome ? "💰" : "💸";
    const sign = isIncome ? "+" : "-";
    const sub = tx.subCategory ? ` › ${tx.subCategory.name}` : "";
    return `${emoji} ${tx.note ?? tx.category.name} (${tx.category.name}${sub})\n   ${sign}${formatIDR(tx.amount)}`;
  });

  const balance = totalIncome - totalExpense;
  const balanceEmoji = balance >= 0 ? "✅" : "⚠️";
  const dateLabel = getTodayDate();

  await bot.sendMessage(
    chatId,
    `📅 *Today's transactions (${dateLabel})*\n\n` +
      lines.join("\n\n") +
      `\n\n─────────────────\n` +
      `💰 Income: ${formatIDR(totalIncome)}\n` +
      `💸 Expense: ${formatIDR(totalExpense)}\n` +
      `${balanceEmoji} Balance: ${formatIDR(balance)}`,
    { parse_mode: "Markdown" },
  );
}
