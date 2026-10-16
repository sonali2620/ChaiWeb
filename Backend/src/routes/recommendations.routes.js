import express from "express";
import { Product } from "../models/Product.js";
import { Customer } from "../models/customer.js";
import { Order } from "../models/order.js";
import result from "../utils/result.js";

const router = express.Router();

// Smart recommendation algorithm
router.get("/", async (req, res) => {
  try {
    const { userEmail, currentCategory, cartProductIds } = req.query;

    let cartIds = [];
    if (cartProductIds) {
      cartIds = cartProductIds.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // 1. If cart has Chai, recommend matching Snacks & Combos
    let categoryTarget = "SNACKS";
    let recommendationTitle = "Perfect Pairings for your Chai ☕";

    if (currentCategory === "COFFEE") {
      categoryTarget = "SNACKS";
      recommendationTitle = "Great Snacks to Pair with Coffee ☕";
    } else if (currentCategory === "SNACKS") {
      categoryTarget = "CHAI";
      recommendationTitle = "Complete Your Snack with Kadak Chai ☕";
    }

    let recommendedProducts = await Product.find({
      category: categoryTarget,
      isAvailable: true,
      productId: { $nin: cartIds }
    }).limit(4);

    // 2. Fallback to Bestsellers if not enough
    if (recommendedProducts.length < 3) {
      const bestsellers = await Product.find({
        isAvailable: true,
        productId: { $nin: cartIds },
        _id: { $nin: recommendedProducts.map((p) => p._id) }
      })
        .sort({ isBestseller: -1, rating: -1 })
        .limit(4 - recommendedProducts.length);

      recommendedProducts = [...recommendedProducts, ...bestsellers];
    }

    res.send(
      result.createResult(null, {
        title: recommendationTitle,
        products: recommendedProducts
      })
    );
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
