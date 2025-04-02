import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import wishlistRoutes from "./routes/wishlist.js";
import userRoutes from "./routes/user.js";
import giftRoutes from "./routes/gift.js";
import publicWishlistRoutes from "./routes/publicWishlist.js";

const isDev = process.env.ENVIREMENT === "development";

dotenv.config();
const app = express();

app.use(express.json());

if (isDev) {
  app.use(
    cors({
      origin: [
        "https://ed5954eb283dc9eedab6866e33382a1d.serveo.net",
        "http://localhost:5173",
      ],
    }),
  );
}

app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", userRoutes);
app.use("/api/gift", giftRoutes);
app.use("/api/public/wishlist", publicWishlistRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
