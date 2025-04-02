import express from "express";
import Wishlist from "../models/Wishlist.js";
import Gift from "../models/Gift.js";

const router = express.Router();

// GET /api/public/wishlist/:id – получение публичного вишлиста (без аутентификации)
router.get("/:id", async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id).lean();
    if (!wishlist) return res.status(404).json({ message: "Вишлист не найден" });
    // Получаем подарки, связанные с этим вишлистом
    const gifts = await Gift.find({ wishlist: wishlist._id }).lean();
    wishlist.gifts = gifts;
    return res.json({ wishlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
