import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { ENV } from "../config/env";
import { UserRole } from "../types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: UserRole;
  chamberDesignation: string;
  barEnrollmentNo?: string;
  associateId?: string;
  avatarUrl?: string;
  bio?: string;
  authProvider: "credentials" | "google";
  allowedInstitutions?: mongoose.Types.ObjectId[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "advocate", "associate"],
      default: "associate",
      index: true,
    },
    chamberDesignation: { type: String, default: "Legal Practitioner" },
    barEnrollmentNo: { type: String, default: "" },
    associateId: { type: String, default: "", trim: true, index: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    allowedInstitutions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Institution",
      },
    ],
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    lastActiveAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
