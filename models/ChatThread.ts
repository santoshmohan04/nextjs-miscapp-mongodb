import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatThread {
  userId: mongoose.Types.ObjectId;
  title: string;
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatThreadDocument extends IChatThread, Document {
  _id: mongoose.Types.ObjectId;
}

const ChatThreadSchema = new Schema<IChatThreadDocument>(
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
      default: "New Thread",
    },
    lastMessageAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

ChatThreadSchema.index({ userId: 1, lastMessageAt: -1 });

let ChatThread: Model<IChatThreadDocument>;

if ((mongoose.models as any).ChatThread) {
  ChatThread = mongoose.models.ChatThread as Model<IChatThreadDocument>;
} else {
  ChatThread = mongoose.model<IChatThreadDocument>("ChatThread", ChatThreadSchema);
}

export default ChatThread;
