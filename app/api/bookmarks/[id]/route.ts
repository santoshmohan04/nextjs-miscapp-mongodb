import { NextResponse } from "next/server";
import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const body = await req.json();
  const updated = await Bookmark.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  await Bookmark.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}