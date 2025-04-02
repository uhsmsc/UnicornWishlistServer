import express from "express";
import jwt from "jsonwebtoken";
import Wishlist from "../models/Wishlist.js";
import Gift from "../models/Gift.js";

const router = express.Router();

// Простое middleware для проверки JWT-токена
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Нет токена" });
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Неверный токен" });
  }
};

// POST /api/wishlist – создание нового вишлиста
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, comment, eventDate, bookingPrivacy } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Название вишлиста обязательно" });
    }

    // Создаем новый вишлист; модель Wishlist должна иметь поля: title, comment, eventDate, bookingPrivacy, user
    const wishlist = new Wishlist({
      title,
      comment,
      eventDate: eventDate ? new Date(eventDate) : null,
      bookingPrivacy,
      user: req.userId,
    });

    await wishlist.save();
    return res.json(wishlist);
  } catch (error) {
    console.error("Ошибка создания вишлиста:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

// GET /api/wishlist/:id – получение данных вишлиста с подарками
router.get("/:id", authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id).lean();
    if (!wishlist)
      return res.status(404).json({ message: "Вишлист не найден" });
    
    // Если подарки не встроены в схему вишлиста, можно выполнить отдельный запрос:
    const gifts = await Gift.find({ wishlist: wishlist._id }).lean();
    wishlist.gifts = gifts;

    return res.json({ wishlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: "Вишлист не найден" });
    }

    if (wishlist.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    // Удаляем все подарки, связанные с этим вишлистом
    await Gift.deleteMany({ wishlist: wishlist._id });

    // Удаляем сам вишлист
    await wishlist.deleteOne();

    return res.json({ message: "Вишлист и все его подарки удалены" });
  } catch (err) {
    console.error("Ошибка удаления вишлиста:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PUT /api/wishlist/:id – обновление вишлиста
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { title, comment, eventDate, bookingPrivacy } = req.body;
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: "Вишлист не найден" });
    }
    // Проверяем, является ли пользователь владельцем вишлиста
    if (wishlist.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    // Обновляем поля
    wishlist.title = title;
    wishlist.comment = comment;
    wishlist.eventDate = eventDate ? new Date(eventDate) : null;
    wishlist.bookingPrivacy = bookingPrivacy;
    
    await wishlist.save();
    
    // Получаем подарки, связанные с этим вишлистом
    const gifts = await Gift.find({ wishlist: wishlist._id }).lean();
    const updatedWishlist = wishlist.toObject({ virtuals: true });
    updatedWishlist.gifts = gifts;
    
    return res.json({ wishlist: updatedWishlist });
  } catch (err) {
    console.error("Ошибка обновления вишлиста:", err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});




export default router;
