import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

app.post(`/${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Telegram ID Checker Bot is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  const webhookUrl = `https://id-checker-bot.vercel.app/${process.env.BOT_TOKEN}`;
  await bot.telegram.setWebhook(webhookUrl);
});
