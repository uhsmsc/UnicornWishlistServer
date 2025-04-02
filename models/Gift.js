import mongoose from "mongoose";

const GiftSchema = new mongoose.Schema({
  link: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number },
  currency: { type: String, default: "₽" },
  photo: { type: String },
  desirability: { type: Number, default: 1 },
  comment: { type: String },
  wishlist: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist", required: true },
  reservedBy: { type: String, default: null },
});


export default mongoose.model("Gift", GiftSchema);
