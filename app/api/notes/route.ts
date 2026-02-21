import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import Note from "@/models/Note";
import { logActivity } from "@/lib/activity-log";

function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map((tag) => String(tag).trim()).filter(Boolean)));
  }

  if (typeof input === "string") {
    return Array.from(new Set(input.split(",").map((tag) => tag.trim()).filter(Boolean)));
  }

  return [];
}

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const search = (searchParams.get("search") ?? "").trim();

    const query: Record<string, unknown> = {
      userId: sessionUser._id,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const tagsFromTag = searchParams.getAll("tag");
    const tagsFromTags = parseTags(searchParams.get("tags") ?? "");
    const tags = Array.from(
      new Set([...tagsFromTag, ...tagsFromTags].map((tag) => tag.trim()).filter(Boolean))
    );

    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    const total = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort({ pinned: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return successResponse(notes, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      count: notes.length,
      search,
      tags,
    });
  } catch {
    return errorResponse("Failed to fetch notes", 500, "NOTES_FETCH_FAILED");
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const body = await req.json();
    const title = String(body?.title ?? "").trim();

    if (!title) {
      return errorResponse("Title is required", 400, "VALIDATION_ERROR");
    }

    const note = await Note.create({
      userId: sessionUser._id,
      title,
      content: String(body?.content ?? ""),
      tags: parseTags(body?.tags),
      pinned: Boolean(body?.pinned),
    });

    await logActivity(sessionUser._id, "NOTE_CREATED", "note", note._id, {
      title: note.title,
      pinned: note.pinned,
    });

    return successResponse(note, { statusCode: 201 });
  } catch {
    return errorResponse("Failed to create note", 500, "NOTE_CREATE_FAILED");
  }
}
