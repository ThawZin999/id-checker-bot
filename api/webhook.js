import { Telegraf } from "telegraf";

// Initialize bot with environment variable
const bot = new Telegraf(process.env.BOT_TOKEN);

// Configure webhook settings
bot.telegram.setWebhook(process.env.WEBHOOK_URL);

// Export a function to handle webhook requests
export default async function handler(request, response) {
  try {
    // Only allow POST requests
    if (request.method !== 'POST') {
      response.status(200).json({ ok: true });
      return;
    }

    // Process the update
    await bot.handleUpdate(request.body, response);
  } catch (error) {
    console.error('Error in webhook handler:', error);
    response.status(500).json({ ok: false, error: error.message });
  }
}

// Command to get User ID & Chat ID
bot.start((ctx) => {
  ctx.reply(`👋 Hello, ${ctx.from.first_name}!
🔹 Your User ID: ${ctx.from.id}
🔹 Your Chat ID: ${ctx.chat.id}`);
});

// Handler for all messages, including those in groups/supergroups
bot.on("message", async (ctx) => {
  const message = ctx.message;
  const chatType = ctx.chat.type;

  const replyText = `
📩 **Message Info**:
- 🔹 Chat Type: ${chatType}
- 🔹 Chat ID: ${ctx.chat.id}
- 🔹 Message ID: ${message.message_id}
- 🔹 Forwarded From User ID: ${
    message.forward_from ? message.forward_from.id : "N/A"
  }
- 🔹 Forwarded From Chat ID: ${
    message.forward_from_chat ? message.forward_from_chat.id : "N/A"
  }
- 🔹 Forwarded Message ID: ${message.forward_from_message_id || "N/A"}
`;

  try {
    await ctx.reply(replyText);
  } catch (err) {
    if (err.response?.parameters?.migrate_to_chat_id) {
      const newChatId = err.response.parameters.migrate_to_chat_id;
      await ctx.telegram.sendMessage(newChatId, replyText);
    } else {
      console.error("Error sending message:", err);
    }
  }
});

// Handler for channel posts
bot.on("channel_post", async (ctx) => {
  const post = ctx.channelPost;
  const replyText = `
📢 **Channel Post Info**:
- 🔹 Channel ID: ${ctx.chat.id}
- 🔹 Message ID: ${post.message_id}
- 🔹 Text: ${post.text ? post.text : "No text (media or other content)"}
`;
  try {
    await ctx.reply(replyText);
  } catch (err) {
    console.error("Error sending channel post info:", err);
  }
});

// Webhook handler for Vercel
export default async function handler(request, response) {
  try {
    if (request.method === "POST") {
      await bot.handleUpdate(request.body);
      response.status(200).json({ ok: true });
    } else {
      response.status(200).json({ ok: true, message: "Webhook is active" });
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    response.status(500).json({ ok: false, error: error.message });
  }
}
