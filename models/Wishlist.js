import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    comment: { type: String },
    eventDate: { type: Date },
    bookingPrivacy: { 
      type: String, 
      enum: ["with_names", "without_names", "none"], 
      default: "none" 
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

WishlistSchema.virtual("gifts", {
  ref: "Gift",
  localField: "_id",
  foreignField: "wishlist",
});

WishlistSchema.set("toObject", { virtuals: true });
WishlistSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Wishlist", WishlistSchema);
