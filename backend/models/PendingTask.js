import mongoose from "mongoose";

const pendingTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    translations: {
      sv: {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      en: {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      pl: {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      uk: {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    reporterEmail: {
      type: String,
      required: true,
      trim: true,
    },
    reporterPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    apartmentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    messageId: {
      type: String,
      unique: true,
      sparse: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    declinedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    declinedAt: {
      type: Date,
    },
    declineReason: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PendingTask = mongoose.model("PendingTask", pendingTaskSchema);
export default PendingTask;
