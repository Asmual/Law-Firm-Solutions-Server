import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettingDocument extends Document {
  key: string;
  value: unknown;
  category: "rbac" | "branding" | "security" | "system";
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISettingDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ["rbac", "branding", "security", "system"],
      default: "system",
      index: true,
    },
    description: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const Setting: Model<ISettingDocument> =
  mongoose.models.Setting ||
  mongoose.model<ISettingDocument>("Setting", SettingSchema);
