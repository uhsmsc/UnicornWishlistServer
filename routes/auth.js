// server/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyTelegramAuth } from "../utils/telegramAuth.js";

const router = express.Router();

// POST-маршрут для авторизации через Telegram
router.post("/telegram", async (req, res) => {
  try {
    const { hash: receivedHash, id, first_name } = req.body;
    if (!receivedHash || !id || !first_name) {
      return res.status(400).json({ message: "Отсутствуют необходимые данные для авторизации" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Используем утилиту для проверки подлинности данных
    if (!verifyTelegramAuth(req.body, botToken)) {
      return res.status(403).json({ message: "Ошибка проверки подлинности" });
    }

    // Поиск пользователя по telegram_id
    let user = await User.findOne({ telegram_id: id });
    if (!user) {
      user = new User({
        telegram_id: id,
        name: `${first_name} ${req.body.last_name || ""}`.trim(),
        avatar: req.body.photo_url,
      });
      await user.save();
    }

    // Создание JWT-токена
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.json({ token, user });
  } catch (err) {
    console.error("Ошибка авторизации через Telegram:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
