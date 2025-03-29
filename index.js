import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

// Webhook endpoint for Telegram updates
app.post(`/webhook`, async (req, res) => {
  console.log("Received Webhook Update:", JSON.stringify(req.body, null, 2));
  try {
    await bot.handleUpdate(req.body);
    console.log("Update processed successfully");
  } catch (error) {
    console.error("Error processing update:", error);
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

    // Get additional user information
    const firstName = ctx.from.first_name || "Not provided";
    const lastName = ctx.from.last_name || "Not provided";
    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : "Not provided";

    let response = `👤 *Sender Details:*\n`;
    response += `• ID: \`${userId}\`\n`;
    response += `• First Name: ${firstName}\n`;
    response += `• Last Name: ${lastName}\n`;
    response += `• Username: ${username}\n\n`;
    response += `💬 *Chat Details:*\n`;
    response += `• Chat ID: \`${chatId}\`\n`;
    response += `• Message ID: \`${messageId}\`\n`;
    response += `• Message: ${messageText}`;

    // If the message is forwarded, get the original sender info
    if (ctx.message.forward_from) {
      const originalUserId = ctx.message.forward_from.id;
      const originalFirstName =
        ctx.message.forward_from.first_name || "Not provided";
      const originalLastName =
        ctx.message.forward_from.last_name || "Not provided";
      const originalUsername = ctx.message.forward_from.username
        ? `@${ctx.message.forward_from.username}`
        : "Not provided";

      response += `\n\n🔄 *Forwarded From:*\n`;
      response += `• User ID: \`${originalUserId}\`\n`;
      response += `• First Name: ${originalFirstName}\n`;
      response += `• Last Name: ${originalLastName}\n`;
      response += `• Username: ${originalUsername}`;
    } else if (ctx.message.forward_sender_name) {
      response += `\n\n🔄 *Forwarded From:*\n`;
      response += `• Name: ${ctx.message.forward_sender_name}`;
    }

    await ctx.reply(response, { parse_mode: "Markdown" });
    console.log("Reply sent successfully");
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
  const webhookUrl = `https://id-checker-bot.vercel.app/webhook`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`✅ Webhook set: ${webhookUrl}`);
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
});
