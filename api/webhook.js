import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(200).json({ message: "OK" });
      return;
    }

    const { body } = req;

    if (!body || !body.message) {
      res.status(200).json({ message: "No message data" });
      return;
    }

    const { message } = body;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const messageText = message.text || "No text content";
    const messageId = message.message_id;

    const response =
      `📝 Message Info:\n\n` +
      `👤 User ID: ${userId}\n` +
      `💭 Chat ID: ${chatId}\n` +
      `🔢 Message ID: ${messageId}\n` +
      `📨 Message: ${messageText}`;

    await bot.sendMessage(chatId, response);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).json({ error: "Failed to process update" });
  }
};
