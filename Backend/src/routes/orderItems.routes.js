import express from "express";
import { OrderItem } from "../models/orderItems.js";
import { Order } from "../models/order.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

/**
 * =====================================================
 * 1️⃣ CUSTOMER → GET ORDER ITEMS BY ORDER ID
 * =====================================================
 */
router.get("/:orderId", authUser, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send(result.createResult("Invalid Order ID"));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send(result.createResult("Order not found"));
    }

    // Check ownership
    if (
      req.user.role === "CUSTOMER" &&
      order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).send(result.createResult("Access denied"));
    }

    const items = await OrderItem.find({
      orderId: order._id
    }).populate("productId");

    return res.send(result.createResult(null, items));
  } catch (err) {
    return res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 2️⃣ ADMIN → GET ALL ORDER ITEMS
 * =====================================================
 */
router.get("/", authUser, isAdmin, async (req, res) => {
  try {
    const items = await OrderItem.find().populate("productId");
    return res.send(result.createResult(null, items));
  } catch (err) {
    return res.status(500).send(result.createResult(err.message));
  }
});

export default router;