import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityType =
  | "RECIPE_CREATED"
  | "RECIPE_UPDATED"
  | "RECIPE_DELETED"
  | "BOOKMARK_CREATED"
  | "BOOKMARK_DELETED"
  | "NOTE_CREATED";

export interface IActivityLog {
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: mongoose.Types.ObjectId;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "RECIPE_CREATED",
        "RECIPE_UPDATED",
        "RECIPE_DELETED",
        "BOOKMARK_CREATED",
        "BOOKMARK_DELETED",
        "NOTE_CREATED",
      ],
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

let ActivityLog: Model<IActivityLogDocument>;

if ((mongoose.models as any).ActivityLog) {
  ActivityLog = mongoose.models.ActivityLog as Model<IActivityLogDocument>;
} else {
  ActivityLog = mongoose.model<IActivityLogDocument>("ActivityLog", ActivityLogSchema);
}

export default ActivityLog;
