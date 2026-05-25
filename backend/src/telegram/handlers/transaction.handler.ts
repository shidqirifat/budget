import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../../lib/db";
import { parseTransaction } from "../parser";
import { resolveCategory, resolveTypeId, buildCategoryPromptContext } from "../category-mapper";
import { formatIDR, getTodayDate } from "../utils";
import { handleLoginStep } from "./login.handler";

export async function handleMessage(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  if (!msg.text) return;
  if (msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const handled = await handleLoginStep(bot, chatId, msg.text);
  if (handled) return;

  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });

  if (!user) {
    await bot.sendMessage(
      chatId,
      "⚠️ You are not logged in.\n\nUse /login to connect your budget account.",
    );
    return;
  }

  await bot.sendChatAction(chatId, "typing");

  let parsed;
  try {
    const categoryContext = await buildCategoryPromptContext(user.id);
    parsed = await parseTransaction(msg.text, getTodayDate(), categoryContext);
  } catch {
    await bot.sendMessage(
      chatId,
      "❌ Could not parse your message. Please try again with more detail.",
    );
    return;
  }

  if (!parsed.total_amount || parsed.total_amount <= 0) {
    await bot.sendMessage(
      chatId,
      '❌ No amount detected. Please include a price (e.g. "Lunch 50rb").',
    );
    return;
  }

  const txTypeName: "income" | "expense" =
    parsed.type === "income" ? "income" : "expense";
  const [typeId, resolved] = await Promise.all([
    resolveTypeId(txTypeName),
    resolveCategory(parsed.category, parsed.sub_category, txTypeName, user.id),
  ]);

  if (!typeId || !resolved) {
    await bot.sendMessage(
      chatId,
      "❌ Could not determine transaction type or category. Please try again.",
    );
    return;
  }

  const txDate = parsed.date
    ? new Date(`${parsed.date}T00:00:00.000Z`)
    : new Date();

  const transaction = await prisma.transaction.create({
    data: {
      amount: parsed.total_amount,
      typeId,
      categoryId: resolved.categoryId,
      subCategoryId: resolved.subCategoryId ?? undefined,
      date: txDate,
      note: ((s) => s.charAt(0).toUpperCase() + s.slice(1))(parsed.description ?? msg.text),
      userId: user.id,
    },
    include: { type: true, category: true, subCategory: true },
  });

  const emoji = txTypeName === "income" ? "💰" : "💸";
  const sign = txTypeName === "income" ? "+" : "-";
  const subCatLine = transaction.subCategory
    ? `  ↳ ${transaction.subCategory.name}\n`
    : "";

  await bot.sendMessage(
    chatId,
    `${emoji} Transaction recorded!\n\n` +
      `📝 ${transaction.note}\n` +
      `🏷️ ${transaction.category.name}\n` +
      `${subCatLine}` +
      `💵 ${sign}${formatIDR(transaction.amount)}\n` +
      `📅 ${parsed.date ?? getTodayDate()}`,
  );
}
