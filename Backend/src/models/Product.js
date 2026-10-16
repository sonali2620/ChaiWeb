import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    p_name: { 
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
      enum: ["CHAI", "COFFEE", "SNACKS", "COMBOS", "SPECIALS"],
      default: "CHAI"
    },
    imageUrl: {
      type: String,
      trim: true
    },
    isBestseller: {
      type: Boolean,
      default: false
    },
    isSpecial: {
      type: Boolean,
      default: false
    },
    isVeg: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 50,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 12
    },
    ingredients: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 90
    }
  },
  {
    timestamps: true
  }
);

// Search indexing for fast search by name, description, ingredients, category
productSchema.index({ p_name: "text", description: "text", category: "text" });

export const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema, "Product");