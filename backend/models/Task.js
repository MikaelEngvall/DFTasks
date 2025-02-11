//models/Task.js

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    translations: {
      sv: { type: String, trim: true },
      en: { type: String, trim: true },
      pl: { type: String, trim: true },
      uk: { type: String, trim: true },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["pending", "in progress", "completed", "cannot fix"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [commentSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Reporter information
    reporterName: {
      type: String,
      trim: true,
    },
    reporterEmail: {
      type: String,
      trim: true,
    },
    reporterPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    apartmentNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Metod för att sortera kommentarer efter datum
taskSchema.methods.sortComments = function () {
  if (this.comments && this.comments.length > 0) {
    this.comments.sort((a, b) => b.createdAt - a.createdAt);
  }
  return this;
};

// Pre-save hook för att sortera kommentarer
taskSchema.pre("save", function (next) {
  if (this.isModified("comments")) {
    this.sortComments();
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
