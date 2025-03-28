import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

// Webhook endpoint for Telegram updates
app.post(`/webhook`, async (req, res) => {
  console.log('Received webhook update:', req.body);
  try {
    await bot.handleUpdate(req.body);
    console.log('Update processed successfully');
  } catch (error) {
    console.error('Error processing update:', error);
  }
  res.sendStatus(200);
});

// Handle messages
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    const messageText = ctx.message.text || "[Non-text message]";

    console.log('Processing message:', {
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

    await ctx.reply(response, { parse_mode: "Markdown" });
    console.log('Reply sent successfully');
  } catch (error) {
    console.error("Error in message handler:", error);
    try {
      await ctx.reply("Sorry, there was an error processing your message.");
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
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
