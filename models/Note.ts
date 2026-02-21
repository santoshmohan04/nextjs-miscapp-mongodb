import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoteDocument extends INote, Document {
  _id: mongoose.Types.ObjectId;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

let Note: Model<INoteDocument>;

if ((mongoose.models as any).Note) {
  Note = mongoose.models.Note as Model<INoteDocument>;
} else {
  Note = mongoose.model<INoteDocument>("Note", NoteSchema);
}

export default Note;
