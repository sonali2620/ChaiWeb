import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["ORDER", "PROMO", "SYSTEM"],
      default: "ORDER"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
