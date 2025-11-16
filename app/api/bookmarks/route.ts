import { NextResponse } from "next/server";
import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";
import { getThumbnail } from "@/utils/get-thumbnail";

export async function GET() {
  await connectDB();
  const bookmarks = await Bookmark.find().sort({ updatedAt: -1 });
  return NextResponse.json(bookmarks);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const thumbnail = await getThumbnail(body.link);

  const bookmark = await Bookmark.create({
    ...body,
    thumbnail,
  });

  return NextResponse.json(bookmark, { status: 201 });
}