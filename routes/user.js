import express from "express";
import User from "../models/User.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "wishlists",
        populate: { path: "gifts" },
      })
      .lean();
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    return res.json({ user });
  } catch (err) {
    console.error("Ошибка получения профиля:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
