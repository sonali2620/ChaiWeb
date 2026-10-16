import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      default: "PERCENT"
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minOrder: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 100
    },
    description: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    validTill: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  {
    timestamps: true
  }
);

export const Coupon =
  mongoose.models.Coupon ||
  mongoose.model("Coupon", couponSchema);
