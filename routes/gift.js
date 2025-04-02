import express from "express";
import jwt from "jsonwebtoken";
import Gift from "../models/Gift.js";

const router = express.Router();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Нет токена" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Неверный токен" });
  }
};

router.post("/", authenticate, async (req, res) => {
  try {
    const { link, title, price, photo, desirability, comment, wishlist } = req.body;
    if (!link || !title || !wishlist) {
      return res.status(400).json({ message: "Обязательные поля не заполнены" });
    }
    const gift = new Gift({
      link,
      title,
      price,
      photo,
      desirability,
      comment,
      wishlist,
    });
    await gift.save();
    return res.json(gift);
  } catch (err) {
    console.error("Ошибка создания подарка:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PUT /api/gift/:id – обновление подарка
router.put("/:id", authenticate, async (req, res) => {
  try {
    const updatedGift = await Gift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGift) {
      return res.status(404).json({ message: "Подарок не найден" });
    }
    return res.json(updatedGift);
  } catch (err) {
    console.error("Ошибка обновления подарка:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

// POST /api/gift/reserve – резервирование подарка
router.post("/reserve", async (req, res) => {
  try {
    const { giftId, reserverName } = req.body;

    if (!giftId || !reserverName) {
      return res.status(400).json({ message: "Не указан подарок или имя резервирующего" });
    }

    const gift = await Gift.findById(giftId);
    if (!gift) {
      return res.status(404).json({ message: "Подарок не найден" });
    }

    // Проверяем, не зарезервирован ли уже подарок
    if (gift.reservedBy) {
      return res.status(400).json({ message: "Подарок уже зарезервирован" });
    }

    // Резервируем подарок
    gift.reservedBy = reserverName;
    await gift.save();

    return res.json({ message: "Подарок успешно зарезервирован", gift });
  } catch (error) {
    console.error("Ошибка бронирования подарка:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const deletedGift = await Gift.findByIdAndDelete(req.params.id);
    if (!deletedGift) {
      return res.status(404).json({ message: "Подарок не найден" });
    }
    return res.json({ message: "Подарок удален" });
  } catch (err) {
    console.error("Ошибка удаления подарка:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});


export default router;
