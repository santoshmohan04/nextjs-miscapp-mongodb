import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    favorite: { type: Boolean, default: false },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Bookmark ||
  mongoose.model("Bookmark", BookmarkSchema);
