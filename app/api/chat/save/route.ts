import { NextResponse } from "next/server";
import ChatHistory from "@/models/ChatHistory";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  await connectDB();

  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const msg = await req.json();

  await ChatHistory.findOneAndUpdate(
    { userId: user._id },
    { $push: { messages: msg } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
