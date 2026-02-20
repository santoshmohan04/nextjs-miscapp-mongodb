import { NextResponse } from "next/server";
import ChatHistory from "@/models/ChatHistory";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  await connectDB();

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ messages: [] });

  const data = await ChatHistory.findOne({ userId: user._id });

  return NextResponse.json(data || { messages: [] });
}
