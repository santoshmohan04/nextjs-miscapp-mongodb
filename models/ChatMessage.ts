import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  threadId: mongoose.Types.ObjectId;
  sender: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessageDocument extends IChatMessage, Document {
  _id: mongoose.Types.ObjectId;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatThread",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ChatMessageSchema.index({ threadId: 1, createdAt: 1 });

let ChatMessage: Model<IChatMessageDocument>;

if ((mongoose.models as any).ChatMessage) {
  ChatMessage = mongoose.models.ChatMessage as Model<IChatMessageDocument>;
} else {
  ChatMessage = mongoose.model<IChatMessageDocument>("ChatMessage", ChatMessageSchema);
}

export default ChatMessage;
