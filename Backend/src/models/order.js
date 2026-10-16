import mongoose from "mongoose";

const timelineItemSchema = new mongoose.Schema({
  status: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  time: { type: Date, default: Date.now }
});

const orderItemDetailSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productCustomId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: () => `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerName: {
      type: String,
      default: "Valued Customer"
    },
    customerPhone: {
      type: String,
      default: ""
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      landmark: { type: String, default: "" },
      fullAddress: { type: String, default: "" }
    },
    items: [orderItemDetailSchema],
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    couponCode: {
      type: String,
      default: ""
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD", "CARD", "NETBANKING"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING"
    },
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "ORDER PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED"
      ],
      default: "PLACED"
    },
    specialInstructions: {
      type: String,
      default: ""
    },
    estimatedMinutes: {
      type: Number,
      default: 20
    },
    timeline: [timelineItemSchema],
    orderDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);