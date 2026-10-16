import express from "express";
import { Coupon } from "../models/Coupon.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// Seed initial coupons if empty
const seedCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.insertMany([
        {
          code: "CHAI10",
          discountType: "PERCENT",
          discountValue: 10,
          minOrder: 100,
          maxDiscount: 50,
          description: "Get 10% OFF on all orders above ₹100",
          isActive: true
        },
        {
          code: "WELCOME50",
          discountType: "FLAT",
          discountValue: 50,
          minOrder: 199,
          maxDiscount: 50,
          description: "Flat ₹50 OFF on your meal for orders above ₹199",
          isActive: true
        },
        {
          code: "TEATIME",
          discountType: "PERCENT",
          discountValue: 15,
          minOrder: 150,
          maxDiscount: 75,
          description: "Enjoy 15% OFF during your evening tea cravings (min ₹150)",
          isActive: true
        }
      ]);
      console.log("🎟️ Seeded default promo coupons.");
    }
  } catch (e) {}
};
seedCoupons();

// 1. Get active coupons for customers
router.get("/active", async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validTill: { $gte: new Date() }
    });
    res.send(result.createResult(null, coupons));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 2. Validate Coupon for cart
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).send(result.createResult("Coupon code is required"));
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      validTill: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).send(result.createResult("Invalid or expired coupon code"));
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < (coupon.minOrder || 0)) {
      return res.status(400).send(
        result.createResult(`Minimum order value of ₹${coupon.minOrder} is required for this coupon`)
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENT") {
      const calculated = (orderSubtotal * coupon.discountValue) / 100;
      discount = Math.min(calculated, coupon.maxDiscount || calculated);
    } else {
      discount = Math.min(coupon.discountValue, orderSubtotal);
    }

    res.send(
      result.createResult(null, {
        code: coupon.code,
        discount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        applied: true
      }, `Coupon "${coupon.code}" applied! You saved ₹${discount}`)
    );
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 3. Admin: Get all coupons
router.get("/all", authUser, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.send(result.createResult(null, coupons));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 4. Admin: Create coupon
router.post("/", authUser, isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrder, maxDiscount, description, validTill } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: Number(minOrder || 0),
      maxDiscount: Number(maxDiscount || 100),
      description,
      validTill: validTill ? new Date(validTill) : undefined
    });

    res.status(201).send(result.createResult(null, coupon, "Coupon created successfully"));
  } catch (err) {
    res.status(400).send(result.createResult(err.message));
  }
});

// 5. Admin: Delete coupon
router.delete("/:id", authUser, isAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.send(result.createResult(null, "Coupon deleted"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
