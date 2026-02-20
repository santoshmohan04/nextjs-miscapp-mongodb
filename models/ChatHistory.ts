import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  time: String,
});

const ChatSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  messages: [ChatMessageSchema],
});

export default mongoose.models.ChatHistory ||
  mongoose.model("ChatHistory", ChatSchema);
