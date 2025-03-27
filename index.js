import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

bot.start((ctx) => {
  ctx.reply("Hello! Send me a message, and I'll show your details.");
});

bot.on("message", (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const messageText = ctx.message.text;

  ctx.reply(
    `👤 *User ID:* ${userId}\n💬 *Chat ID:* ${chatId}\n📩 *Message:* ${messageText}`,
    { parse_mode: "Markdown" }
  );
});

bot.launch();

app.get("/", (req, res) => {
  res.send("Telegram ID Checker Bot is running...");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
