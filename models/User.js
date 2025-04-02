import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    telegram_id: { type: String, unique: true, required: true },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    name: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

UserSchema.virtual("wishlists", {
  ref: "Wishlist",
  localField: "_id",
  foreignField: "user",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export default mongoose.model("User", UserSchema);
