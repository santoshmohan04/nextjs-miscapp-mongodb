import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBookmark {
  title: string;
  link: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  favorite?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookmarkDocument extends IBookmark, Document {
  _id: mongoose.Types.ObjectId;
}

const BookmarkSchema = new Schema<IBookmarkDocument>(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    thumbnail: { type: String },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Turbopack-safe model creation (NO UNION TYPE)
let Bookmark: Model<IBookmarkDocument>;

if ((mongoose.models as any).Bookmark) {
  Bookmark = mongoose.models.Bookmark as Model<IBookmarkDocument>;
} else {
  Bookmark = mongoose.model<IBookmarkDocument>("Bookmark", BookmarkSchema);
}

export default Bookmark;