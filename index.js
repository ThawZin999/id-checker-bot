import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Start Command
bot.start((ctx) => {
  ctx.reply(
    "Hello! Send me a message or forward one, and I'll show the details."
  );
});

// Handle All Messages
bot.on("message", (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text || "[Non-text message]";

  let response = `👤 *User ID:* ${userId}\n💬 *Chat ID:* ${chatId}\n📩 *Message:* ${messageText}`;

  // Check if the message is forwarded
  if (ctx.message.forward_from) {
    const originalUserId = ctx.message.forward_from.id;
    const originalUserName = ctx.message.forward_from.username || "No username";

    response += `\n\n🔄 *Forwarded From:*\n👤 *User ID:* ${originalUserId}\n📛 *Username:* @${originalUserName}`;
  }

  ctx.reply(response, { parse_mode: "Markdown" });
});

bot.launch();

app.get("/", (req, res) => {
  res.send("Telegram ID Checker Bot is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
