import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../../lib/db";
import { formatIDR } from "../utils";

export async function handleUndo(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  const chatId = msg.chat.id;
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });
  if (!user) {
    await bot.sendMessage(chatId, "⚠️ Use /login first.");
    return;
  }

  const last = await prisma.transaction.findFirst({
    where: { userId: user.id },
    include: { type: true, category: true, subCategory: true },
    orderBy: { createdAt: "desc" },
  });

  if (!last) {
    await bot.sendMessage(chatId, "📭 No transactions to undo.");
    return;
  }

  const isIncome = last.type.name === "income";
  const emoji = isIncome ? "💰" : "💸";
  const sign = isIncome ? "+" : "-";
  const sub = last.subCategory ? ` › ${last.subCategory.name}` : "";
  const dateStr = last.date.toISOString().slice(0, 10);

  await bot.sendMessage(
    chatId,
    `🗑️ *Delete last transaction?*\n\n` +
      `${emoji} ${last.note ?? last.category.name}\n` +
      `🏷️ ${last.category.name}${sub}\n` +
      `💵 ${sign}${formatIDR(last.amount)}\n` +
      `📅 ${dateStr}\n\n` +
      `This cannot be undone.`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Yes, delete it", callback_data: `undo_confirm:${last.id}` },
            { text: "❌ Cancel", callback_data: "undo_cancel" },
          ],
        ],
      },
    },
  );
}

export async function handleUndoCallbackQuery(
  query: TelegramBot.CallbackQuery,
  bot: TelegramBot,
): Promise<void> {
  if (!query.data || !query.message) return;
  const chatId = query.message.chat.id;

  if (query.data === "undo_cancel") {
    await bot.editMessageText("↩️ Cancelled — no changes made.", {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
    await bot.answerCallbackQuery(query.id);
    return;
  }

  if (query.data.startsWith("undo_confirm:")) {
    const txId = query.data.slice("undo_confirm:".length);
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });

    if (!user) {
      await bot.answerCallbackQuery(query.id, { text: "⚠️ Not logged in." });
      return;
    }

    const tx = await prisma.transaction.findFirst({
      where: { id: txId, userId: user.id },
    });

    if (!tx) {
      await bot.editMessageText(
        "⚠️ Transaction not found — it may have already been deleted.",
        {
          chat_id: chatId,
          message_id: query.message.message_id,
        },
      );
      await bot.answerCallbackQuery(query.id);
      return;
    }

    await prisma.transaction.delete({ where: { id: txId } });

    await bot.editMessageText("✅ Last transaction deleted.", {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
    await bot.answerCallbackQuery(query.id);
  }
}
