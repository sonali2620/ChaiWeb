import express from "express";
import { Order } from "../models/order.js";
import { OrderItem } from "../models/orderItems.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Notification } from "../models/Notification.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

/**
 * =====================================================
 * 1️⃣ ADD TO CART (Backward Compatible)
 * =====================================================
 */
router.post("/add-to-cart", authUser, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const customerEmail = req.user.email.toLowerCase();

    // Find product by _id or productId
    let product = await Product.findById(productId);
    if (!product) {
      product = await Product.findOne({ productId });
    }
    if (!product) {
      return res.status(404).send(result.createResult("Product not found"));
    }

    if (!product.isAvailable || product.stockQuantity <= 0) {
      return res.status(400).send(result.createResult("Product is currently out of stock"));
    }

    // Find existing cart (PLACED order acting as active cart)
    let order = await Order.findOne({
      customerEmail,
      orderStatus: "PLACED"
    });

    if (!order) {
      order = await Order.create({
        orderId: `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        customerEmail,
        totalAmount: 0,
        subtotal: 0,
        orderStatus: "PLACED",
        items: []
      });
    }

    // Check if item exists in OrderItem
    let existingItem = await OrderItem.findOne({
      orderId: order._id,
      productId: product._id
    });

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      await existingItem.save();
    } else {
      await OrderItem.create({
        orderId: order._id,
        productId: product._id,
        quantity: Number(quantity),
        price: product.price
      });
    }

    // Recalculate total from OrderItem collection
    const items = await OrderItem.find({ orderId: order._id }).populate("productId");

    let sum = 0;
    const embeddedItems = [];

    for (const it of items) {
      sum += it.quantity * it.price;
      embeddedItems.push({
        productId: it.productId?._id || it.productId,
        productCustomId: it.productId?.productId || "",
        name: it.productId?.p_name || "Product",
        price: it.price,
        quantity: it.quantity,
        imageUrl: it.productId?.imageUrl || ""
      });
    }

    order.items = embeddedItems;
    order.subtotal = sum;
    order.totalAmount = sum;
    await order.save();

    res.send(result.createResult(null, order, "Item added to cart"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 2️⃣ GET CART ITEMS (Backward Compatible + Enriched)
 * =====================================================
 */
router.get("/cart", authUser, async (req, res) => {
  try {
    const customerEmail = req.user.email.toLowerCase();

    const order = await Order.findOne({
      customerEmail,
      orderStatus: "PLACED"
    });

    if (!order) {
      return res.send(result.createResult(null, []));
    }

    const items = await OrderItem.find({ orderId: order._id }).populate("productId");

    // Format for frontend
    const formattedItems = items.map((item) => ({
      _id: item._id,
      orderId: item.orderId,
      productId: item.productId?._id || item.productId,
      productCustomId: item.productId?.productId,
      productName: item.productId?.p_name || "Chai Item",
      imageUrl: item.productId?.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
      price: item.price,
      quantity: item.quantity,
      category: item.productId?.category || "CHAI"
    }));

    res.send(result.createResult(null, formattedItems));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 3️⃣ UPDATE / REMOVE ITEM FROM CART
 * =====================================================
 */
router.put("/cart/update-item", authUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const customerEmail = req.user.email.toLowerCase();

    const order = await Order.findOne({
      customerEmail,
      orderStatus: "PLACED"
    });

    if (!order) {
      return res.status(404).send(result.createResult("Cart not found"));
    }

    if (quantity <= 0) {
      await OrderItem.deleteOne({ orderId: order._id, productId });
    } else {
      await OrderItem.updateOne(
        { orderId: order._id, productId },
        { $set: { quantity: Number(quantity) } }
      );
    }

    // Refresh totals
    const items = await OrderItem.find({ orderId: order._id });
    const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.price, 0);
    order.subtotal = subtotal;
    order.totalAmount = subtotal;
    await order.save();

    res.send(result.createResult(null, { subtotal, itemCount: items.length }, "Cart updated"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

router.delete("/cart/clear", authUser, async (req, res) => {
  try {
    const customerEmail = req.user.email.toLowerCase();

    const order = await Order.findOne({
      customerEmail,
      orderStatus: "PLACED"
    });

    if (order) {
      await OrderItem.deleteMany({ orderId: order._id });
      await Order.findByIdAndDelete(order._id);
    }

    res.send(result.createResult(null, "Cart cleared successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 4️⃣ PRODUCTION CHECKOUT & ORDER CREATION
 * =====================================================
 */
router.post("/checkout", authUser, async (req, res) => {
  try {
    const customerEmail = req.user.email.toLowerCase();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      items: incomingItems,
      couponCode,
      paymentMethod = "COD",
      specialInstructions
    } = req.body;

    if (!incomingItems || incomingItems.length === 0) {
      return res.status(400).send(result.createResult("Cart cannot be empty"));
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.pincode) {
      return res.status(400).send(result.createResult("Complete delivery address is required"));
    }

    // 1. Verify item prices and availability directly against database
    let subtotal = 0;
    const validatedItems = [];

    for (const item of incomingItems) {
      const pId = item.productId || item._id;
      let product = await Product.findById(pId);
      if (!product && item.productCustomId) {
        product = await Product.findOne({ productId: item.productCustomId });
      }

      if (!product) {
        return res.status(400).send(result.createResult(`Product ${item.productName || pId} not found`));
      }

      if (!product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).send(
          result.createResult(`Sorry, "${product.p_name}" has only ${product.stockQuantity} items in stock.`)
        );
      }

      const itemTotal = product.price * Number(item.quantity);
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        productCustomId: product.productId,
        name: product.p_name,
        price: product.price,
        quantity: Number(item.quantity),
        imageUrl: product.imageUrl
      });
    }

    // 2. Validate Coupon securely on server
    let discountAmount = 0;
    let validatedCoupon = null;

    if (couponCode && couponCode.trim()) {
      validatedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        validTill: { $gte: new Date() }
      });

      if (validatedCoupon) {
        if (subtotal >= (validatedCoupon.minOrder || 0)) {
          if (validatedCoupon.discountType === "PERCENT") {
            const rawDiscount = (subtotal * validatedCoupon.discountValue) / 100;
            discountAmount = Math.min(rawDiscount, validatedCoupon.maxDiscount || rawDiscount);
          } else {
            discountAmount = Math.min(validatedCoupon.discountValue, subtotal);
          }
        }
      }
    }

    // 3. Tax & Delivery calculation
    const taxAmount = Math.round(subtotal * 0.05); // 5% GST on F&B
    const deliveryFee = subtotal >= 200 ? 0 : 30; // Free delivery above 200
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee);

    // 4. Payment status
    const paymentStatus = paymentMethod === "COD" ? "PENDING" : "COMPLETED";

    // 5. Initial Timeline
    const initialTimeline = [
      {
        status: "ORDER PLACED",
        title: "Order Placed",
        description: "Your order has been received and sent to Chai Adda café kitchen.",
        time: new Date()
      }
    ];

    // 6. Create Confirmed Order
    const newOrder = await Order.create({
      orderId: `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      customerEmail,
      customerName: customerName || req.user.name || customerEmail.split("@")[0],
      customerPhone: customerPhone || "",
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city || "Pune",
        pincode: deliveryAddress.pincode,
        landmark: deliveryAddress.landmark || "",
        fullAddress: `${deliveryAddress.street}, ${deliveryAddress.landmark ? deliveryAddress.landmark + ", " : ""}${deliveryAddress.city || "Pune"} - ${deliveryAddress.pincode}`
      },
      items: validatedItems,
      subtotal,
      discountAmount,
      taxAmount,
      deliveryFee,
      totalAmount,
      couponCode: validatedCoupon ? validatedCoupon.code : "",
      paymentMethod,
      paymentStatus,
      orderStatus: "ORDER PLACED",
      specialInstructions: specialInstructions || "",
      estimatedMinutes: 25,
      timeline: initialTimeline,
      orderDate: new Date()
    });

    // 7. Deduct inventory stock
    for (const valItem of validatedItems) {
      await Product.findByIdAndUpdate(valItem.productId, {
        $inc: { stockQuantity: -valItem.quantity }
      });
    }

    // 8. Clean up active cart (Order with PLACED status if any)
    await Order.deleteMany({ customerEmail, orderStatus: "PLACED", _id: { $ne: newOrder._id } });

    // 9. Send In-App Notification
    await Notification.create({
      userEmail: customerEmail,
      title: "Order Placed! ☕",
      message: `Your order #${newOrder._id.toString().slice(-6).toUpperCase()} for ₹${totalAmount} is confirmed! Estimated preparation time is ~25 mins.`,
      type: "ORDER",
      link: `/orders/${newOrder._id}`
    });

    res.status(201).send(
      result.createResult(
        null,
        newOrder,
        "Order placed successfully! We are preparing your fresh chai."
      )
    );
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 5️⃣ CUSTOMER → GET MY ORDERS (HISTORY & TRACKING)
 * =====================================================
 */
router.get("/my-orders", authUser, async (req, res) => {
  try {
    const customerEmail = req.user.email.toLowerCase();

    // Fetch all finalized orders for this customer (excluding dummy PLACED carts if any)
    const orders = await Order.find({
      customerEmail,
      orderStatus: { $ne: "PLACED" }
    }).sort({ createdAt: -1 });

    res.send(result.createResult(null, orders));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 6️⃣ GET SINGLE ORDER TRACKING DETAILS
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

    // Customer security check: can only view own orders unless Admin
    if (
      req.user.role !== "ADMIN" &&
      order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).send(result.createResult("Access denied to this order"));
    }

    res.send(result.createResult(null, order));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 7️⃣ GET ORDER ITEMS BY ORDER ID (Backward Compatible)
 * =====================================================
 */
router.get("/:orderId/items", authUser, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.send(result.createResult(null, []));
    }

    const order = await Order.findById(orderId);
    if (order && order.items && order.items.length > 0) {
      return res.send(result.createResult(null, order.items));
    }

    const items = await OrderItem.find({ orderId }).populate("productId");
    res.send(result.createResult(null, items));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 8️⃣ ADMIN → GET ALL ORDERS (WITH SEARCH & STATUS FILTER)
 * =====================================================
 */
router.get("/admin/all", authUser, isAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { orderStatus: { $ne: "PLACED" } };

    if (status && status !== "ALL") {
      filter.orderStatus = status;
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { customerEmail: sRegex },
        { customerName: sRegex },
        { customerPhone: sRegex }
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.send(result.createResult(null, orders));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// Admin backwards-compatible `/all` alias
router.get("/all", authUser, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: "PLACED" } }).sort({ createdAt: -1 });
    const resultData = orders.map((o) => ({
      orderId: o._id,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      totalAmount: o.totalAmount,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      items: o.items || []
    }));

    res.send({ status: "success", data: resultData });
  } catch (err) {
    res.send({ status: "error", error: err.message });
  }
});

/**
 * =====================================================
 * 9️⃣ ADMIN → UPDATE ORDER STATUS & TIMELINE
 * =====================================================
 */
router.put("/:orderId/status", authUser, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "ORDER PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT FOR DELIVERY",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).send(result.createResult("Invalid status value"));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send(result.createResult("Order not found"));
    }

    order.orderStatus = status;

    if (status === "DELIVERED" || status === "COMPLETED") {
      order.paymentStatus = "COMPLETED";
    }

    // Status titles and default notes
    const statusTitles = {
      "ORDER PLACED": "Order Received",
      "CONFIRMED": "Order Confirmed",
      "PREPARING": "Brewing & Preparing",
      "READY": "Order Ready",
      "OUT FOR DELIVERY": "Out for Delivery",
      "DELIVERED": "Delivered",
      "COMPLETED": "Completed",
      "CANCELLED": "Order Cancelled"
    };

    const statusDescriptions = {
      "CONFIRMED": "The café has accepted your order and started preparation.",
      "PREPARING": "Our barista is freshly brewing your chai and frying crisp snacks.",
      "READY": "Your order is packed hot & fresh, ready for dispatch.",
      "OUT FOR DELIVERY": "Our delivery partner is on the way to your doorstep.",
      "DELIVERED": "Order delivered. Enjoy your Chai Adda refreshments!",
      "COMPLETED": "Order fulfilled. Thank you for visiting Chai Adda!",
      "CANCELLED": note || "Order was cancelled by the store."
    };

    // Append to timeline
    order.timeline.push({
      status,
      title: statusTitles[status] || status,
      description: note || statusDescriptions[status] || "",
      time: new Date()
    });

    await order.save();

    // Send customer notification
    await Notification.create({
      userEmail: order.customerEmail,
      title: `Order Update: ${status} ☕`,
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status.toLowerCase()}.`,
      type: "ORDER",
      link: `/orders/${order._id}`
    });

    res.send(result.createResult(null, order, "Order status updated"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

/**
 * =====================================================
 * 🔟 ADMIN → DELETE ORDER
 * =====================================================
 */
router.delete("/:orderId", authUser, isAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    await OrderItem.deleteMany({ orderId });
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).send(result.createResult("Order not found"));
    }

    res.send(result.createResult(null, "Order deleted successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;