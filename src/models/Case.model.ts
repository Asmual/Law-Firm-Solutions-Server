import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICaseDocument extends Document {
  chamberFileNo: string;
  institutionId: mongoose.Types.ObjectId;
  institutionName: string;
  matter: string;
  branch?: string;
  focalPerson: {
    name: string;
    designation: string;
    phone: string;
    email?: string;
  };
  caseNumbers: Array<{
    caseNumber: string;
    caseType: string;
    year: string;
    courtDivision: string;
    remarks?: string;
  }>;
  parties: Array<{
    partyNo: number;
    partyType?: string;
    partyNameDetails: string;
    caseReceivedDate?: string;
    searchListEntry?: string;
  }>;
  specialNotes: {
    wokalatnamaNote?: string;
    mainPetitionNote?: string;
    extensionNote?: string;
    generalRemarks?: string;
  };
  assignedAdvocate: {
    advocateId?: mongoose.Types.ObjectId;
    advocateName: string;
    dateAssigned?: string;
    internalRemarks?: string;
  };
  assignedAssociate?: {
    associateId?: mongoose.Types.ObjectId;
    associateCode?: string;
    associateName: string;
    dateAssigned?: string;
    internalRemarks?: string;
  };
  statusUpdates: Array<{
    updateDate: string;
    statusRemarks: string;
    orderDetails?: string;
    nextHearingDate?: string;
    courtName?: string;
    enteredBy?: string;
    createdAt?: Date;
  }>;
  status: "running" | "stay_granted" | "adjourned" | "disposed" | "decreed";
  disposalDetails?: {
    disposalDate?: string;
    outcomeRemarks?: string;
    decreeSummary?: string;
  };
  documents?: Array<{
    title: string;
    fileUrl: string;
    fileType?: string;
    uploadedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICaseDocument>(
  {
    chamberFileNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    institutionName: { type: String, required: true },
    matter: { type: String, required: true, trim: true },
    branch: { type: String, trim: true },
    focalPerson: {
      name: { type: String, default: "" },
      designation: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    caseNumbers: [
      {
        caseNumber: { type: String, required: true },
        caseType: { type: String, required: true },
        year: { type: String, required: true },
        courtDivision: { type: String, required: true },
        remarks: { type: String, default: "" },
      },
    ],
    parties: [
      {
        partyNo: { type: Number, required: true },
        partyType: { type: String, default: "Opposite Party" },
        partyNameDetails: { type: String, required: true },
        caseReceivedDate: { type: String, default: "" },
        searchListEntry: { type: String, default: "" },
      },
    ],
    specialNotes: {
      wokalatnamaNote: { type: String, default: "" },
      mainPetitionNote: { type: String, default: "" },
      extensionNote: { type: String, default: "" },
      generalRemarks: { type: String, default: "" },
    },
    assignedAdvocate: {
      advocateId: { type: Schema.Types.ObjectId, ref: "User" },
      advocateName: { type: String, default: "Unassigned" },
      dateAssigned: { type: String, default: "" },
      internalRemarks: { type: String, default: "" },
    },
    assignedAssociate: {
      associateId: { type: Schema.Types.ObjectId, ref: "User" },
      associateCode: { type: String, default: "" },
      associateName: { type: String, default: "Unassigned" },
      dateAssigned: { type: String, default: "" },
      internalRemarks: { type: String, default: "" },
    },
    statusUpdates: [
      {
        updateDate: { type: String, required: true },
        statusRemarks: { type: String, required: true },
        orderDetails: { type: String, default: "" },
        nextHearingDate: { type: String, default: "" },
        courtName: { type: String, default: "" },
        enteredBy: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["running", "stay_granted", "adjourned", "disposed", "decreed"],
      default: "running",
      index: true,
    },
    disposalDetails: {
      disposalDate: { type: String, default: "" },
      outcomeRemarks: { type: String, default: "" },
      decreeSummary: { type: String, default: "" },
    },
    documents: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: "application/pdf" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Case: Model<ICaseDocument> =
  mongoose.models.Case || mongoose.model<ICaseDocument>("Case", CaseSchema);
