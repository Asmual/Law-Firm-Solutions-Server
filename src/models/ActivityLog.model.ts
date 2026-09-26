import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityAction =
  | "auth:login"
  | "auth:logout"
  | "auth:password_change"
  | "case:create"
  | "case:update"
  | "case:delete"
  | "case:restore"
  | "case:assign"
  | "case:status_add"
  | "case:status_update"
  | "case:document_upload"
  | "case:export"
  | "institution:create"
  | "institution:update"
  | "institution:delete"
  | "user:create"
  | "user:update"
  | "user:status_toggle"
  | "settings:update";

export interface IActivityLogDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  action: ActivityAction;
  entityType: "case" | "institution" | "user" | "auth" | "setting" | "report";
  entityId?: string;
  entityTitle?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ["case", "institution", "user", "auth", "setting", "report"],
      required: true,
      index: true,
    },
    entityId: { type: String, index: true },
    entityTitle: { type: String, default: "" },
    description: { type: String, required: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    beforeState: { type: Schema.Types.Mixed },
    afterState: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ActivityLog: Model<IActivityLogDocument> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDocument>("ActivityLog", ActivityLogSchema);
