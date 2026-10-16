import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    userName: {
      type: String,
      default: "Valued Guest"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },
    productName: {
      type: String,
      default: ""
    },
    isVerifiedBuyer: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Feedback =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);