import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstitutionDocument extends Document {
  name: string;
  shortCode: string;
  category: string;
  branch?: string;
  address?: string;
  focalPerson: {
    name: string;
    designation: string;
    phone: string;
    email?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitutionDocument>(
  {
    name: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      index: true,
    },
    shortCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      default: "Private Commercial Bank",
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    focalPerson: {
      name: { type: String, default: "" },
      designation: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Institution: Model<IInstitutionDocument> =
  mongoose.models.Institution ||
  mongoose.model<IInstitutionDocument>("Institution", InstitutionSchema);
