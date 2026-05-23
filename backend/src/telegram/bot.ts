import TelegramBot from "node-telegram-bot-api";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { parseTransaction } from "./parser";
import {
  resolveCategory,
  resolveTypeId,
  getCategoryListText,
  buildCategoryPromptContext,
} from "./category-mapper";

let bot: TelegramBot | null = null;

// Tracks which chats are mid-login and what step they're on
type LoginState =
  | { step: "await_email" }
  | { step: "await_password"; email: string };
const loginSessions = new Map<number, LoginState>();

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function handleLoginStep(
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

    // Check if another Telegram chat is already linked to this account
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

async function handleTransaction(
  bot: TelegramBot,
  chatId: number,
  text: string,
): Promise<void> {
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
    parsed = await parseTransaction(text, getTodayDate(), categoryContext);
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
      note: ((s) => s.charAt(0).toUpperCase() + s.slice(1))(parsed.description ?? text),
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

export function startTelegramBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled.");
    return;
  }

  bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot started.");

  bot.onText(/^\/start$/, async (msg) => {
    await bot!.sendMessage(
      msg.chat.id,
      "👋 Welcome to Budget Bot!\n\nUse /login to connect your budget account, then send me any transaction message.\n\nCommands:\n/login — sign in with email & password\n/logout — unlink your account\n/categories — show your categories\n/summary — this month's balance\n/today — all transactions recorded today\n/undo — delete the last transaction",
    );
  });

  bot.onText(/^\/login$/, async (msg) => {
    const chatId = msg.chat.id;
    loginSessions.set(chatId, { step: "await_email" });
    await bot!.sendMessage(chatId, "📧 Please send your account email:");
  });

  bot.onText(/^\/logout$/, async (msg) => {
    const chatId = msg.chat.id;
    loginSessions.delete(chatId);
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });
    if (!user) {
      await bot!.sendMessage(chatId, "⚠️ No linked account found.");
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: null },
    });
    await bot!.sendMessage(
      chatId,
      "✅ Logged out. Use /login to connect again.",
    );
  });

  bot.onText(/^\/categories$/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });
    if (!user) {
      await bot!.sendMessage(chatId, "⚠️ Use /login first.");
      return;
    }
    const [expCats, incCats] = await Promise.all([
      getCategoryListText("expense", user.id),
      getCategoryListText("income", user.id),
    ]);
    await bot!.sendMessage(
      chatId,
      `🏷️ *Your categories*\n\n*Expense:*\n${expCats}\n\n*Income:*\n${incCats}`,
      { parse_mode: "Markdown" },
    );
  });

  bot.onText(/^\/summary$/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });
    if (!user) {
      await bot!.sendMessage(chatId, "⚠️ Use /login first.");
      return;
    }

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

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

    await bot!.sendMessage(
      chatId,
      `📊 *This month's summary*\n\n` +
        `💰 Income: ${formatIDR(totalIncome)}\n` +
        `💸 Expense: ${formatIDR(totalExpense)}\n` +
        `${balanceEmoji} Balance: ${formatIDR(balance)}`,
      { parse_mode: "Markdown" },
    );
  });

  bot.onText(/^\/today$/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });
    if (!user) {
      await bot!.sendMessage(chatId, "⚠️ Use /login first.");
      return;
    }

    const now = new Date();
    const from = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    );
    const to = new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: from, lte: to } },
      include: { type: true, category: true, subCategory: true },
      orderBy: { date: "asc" },
    });

    if (transactions.length === 0) {
      await bot!.sendMessage(chatId, "📭 No transactions recorded today.");
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

    await bot!.sendMessage(
      chatId,
      `📅 *Today's transactions (${dateLabel})*\n\n` +
        lines.join("\n\n") +
        `\n\n─────────────────\n` +
        `💰 Income: ${formatIDR(totalIncome)}\n` +
        `💸 Expense: ${formatIDR(totalExpense)}\n` +
        `${balanceEmoji} Balance: ${formatIDR(balance)}`,
      { parse_mode: "Markdown" },
    );
  });

  bot.onText(/^\/undo$/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await prisma.user.findUnique({
      where: { telegramChatId: String(chatId) },
    });
    if (!user) {
      await bot!.sendMessage(chatId, "⚠️ Use /login first.");
      return;
    }

    const last = await prisma.transaction.findFirst({
      where: { userId: user.id },
      include: { type: true, category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
    });

    if (!last) {
      await bot!.sendMessage(chatId, "📭 No transactions to undo.");
      return;
    }

    const isIncome = last.type.name === "income";
    const emoji = isIncome ? "💰" : "💸";
    const sign = isIncome ? "+" : "-";
    const sub = last.subCategory ? ` › ${last.subCategory.name}` : "";
    const dateStr = last.date.toISOString().slice(0, 10);

    await bot!.sendMessage(
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
  });

  bot.on("callback_query", async (query) => {
    if (!query.data || !query.message) return;
    const chatId = query.message.chat.id;

    if (query.data === "undo_cancel") {
      await bot!.editMessageText("↩️ Cancelled — no changes made.", {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
      await bot!.answerCallbackQuery(query.id);
      return;
    }

    if (query.data.startsWith("undo_confirm:")) {
      const txId = query.data.slice("undo_confirm:".length);
      const user = await prisma.user.findUnique({
        where: { telegramChatId: String(chatId) },
      });

      if (!user) {
        await bot!.answerCallbackQuery(query.id, { text: "⚠️ Not logged in." });
        return;
      }

      const tx = await prisma.transaction.findFirst({
        where: { id: txId, userId: user.id },
      });

      if (!tx) {
        await bot!.editMessageText("⚠️ Transaction not found — it may have already been deleted.", {
          chat_id: chatId,
          message_id: query.message.message_id,
        });
        await bot!.answerCallbackQuery(query.id);
        return;
      }

      await prisma.transaction.delete({ where: { id: txId } });

      await bot!.editMessageText("✅ Last transaction deleted.", {
        chat_id: chatId,
        message_id: query.message.message_id,
      });
      await bot!.answerCallbackQuery(query.id);
    }
  });

  // All non-command messages: check login flow first, then treat as transaction
  bot.on("message", async (msg) => {
    if (!msg.text) return;
    if (msg.text.startsWith("/")) return;

    const chatId = msg.chat.id;
    const handled = await handleLoginStep(bot!, chatId, msg.text);
    if (!handled) {
      await handleTransaction(bot!, chatId, msg.text);
    }
  });

  bot.on("polling_error", (err) => {
    console.error("Telegram polling error:", err.message);
  });
}
