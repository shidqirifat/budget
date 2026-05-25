import TelegramBot from "node-telegram-bot-api";

export async function handleStart(msg: TelegramBot.Message, bot: TelegramBot): Promise<void> {
  await bot.sendMessage(
    msg.chat.id,
    "👋 Welcome to Budget Bot!\n\nUse /login to connect your budget account, then send me any transaction message.\n\nCommands:\n/login — sign in with email & password\n/logout — unlink your account\n/categories — show your categories\n/summary — this month's balance\n/today — all transactions recorded today\n/undo — delete the last transaction",
  );
}
