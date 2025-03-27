import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

// Webhook endpoint for Telegram updates
app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Start command
bot.start((ctx) => {
  ctx.reply(
    "Hello! Send me a message or forward one, and I'll show the details."
  );
});

// Handle messages
bot.on("message", (ctx) => {
  try {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const messageText = ctx.message.text || "[Non-text message]";

    let response = `👤 *User ID:* ${userId}\n💬 *Chat ID:* ${chatId}\n📩 *Message:* ${messageText}`;

    // If the message is forwarded, get the original sender info
    if (ctx.message.forward_from) {
      const originalUserId = ctx.message.forward_from.id;
      const originalUserName =
        ctx.message.forward_from.username || "No username";

      response += `\n\n🔄 *Forwarded From:*\n👤 *User ID:* ${originalUserId}\n📛 *Username:* @${originalUserName}`;
    }

    ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

app.get("/", (req, res) => {
  res.send("Telegram ID Checker Bot is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🌍 Server running on port ${PORT}`);

  // Set the Telegram webhook
  const webhookUrl = `https://${process.env.VERCEL_URL}/${process.env.BOT_TOKEN}`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`✅ Webhook set: ${webhookUrl}`);
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
});
