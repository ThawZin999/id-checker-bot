import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

// Webhook endpoint for Telegram updates
app.post(`/webhook`, (req, res) => {
  console.log('Received webhook update:', req.body);
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
    const messageId = ctx.message.message_id;
    const messageText = ctx.message.text || "[Non-text message]";

    console.log('Received message:', {
      userId,
      chatId,
      messageId,
      messageText
    });

    let response = `👤 *User ID:* ${userId}\n💬 *Chat ID:* ${chatId}\n🆔 *Message ID:* ${messageId}\n📩 *Message:* ${messageText}`;

    if (ctx.message.forward_from) {
      const originalUserId = ctx.message.forward_from.id;
      const originalUserName = ctx.message.forward_from.username || "No username";
      response += `\n\n🔄 *Forwarded From:*\n👤 *User ID:* ${originalUserId}\n📛 *Username:* @${originalUserName}`;
    }

    return ctx.reply(response, { parse_mode: "Markdown" })
      .catch(error => {
        console.error('Error sending reply:', error);
      });
  } catch (error) {
    console.error("Error handling message:", error);
    return ctx.reply("Sorry, there was an error processing your message.")
      .catch(console.error);
  }
});

app.get("/", (req, res) => {
  res.send("Telegram ID Checker Bot is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🌍 Server running on port ${PORT}`);

  // Set the Telegram webhook
  const webhookUrl = `https://${process.env.VERCEL_URL}/webhook`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`✅ Webhook set: ${webhookUrl}`);
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
});
