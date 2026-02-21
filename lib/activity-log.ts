import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import ActivityLog, { ActivityType } from "@/models/ActivityLog";

export async function logActivity(
  userId: mongoose.Types.ObjectId | string,
  type: ActivityType,
  entityType: string,
  entityId: mongoose.Types.ObjectId | string,
  metadata?: Record<string, unknown>
) {
  try {
    await connectDB();

    return await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(String(userId)),
      type,
      entityType,
      entityId: new mongoose.Types.ObjectId(String(entityId)),
      metadata,
    });
  } catch (error) {
    console.error("logActivity failed:", error);
    return null;
  }
}
