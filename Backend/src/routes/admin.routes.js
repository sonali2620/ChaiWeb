import express from "express";
import { Order } from "../models/order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/customer.js";
import { User } from "../models/user.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// Real Database-driven Admin Analytics Endpoint
router.get("/analytics", authUser, isAdmin, async (req, res) => {
  try {
    // 1. Total Products
    const totalProducts = await Product.countDocuments();

    // 2. Total Customers
    const totalCustomers = await Customer.countDocuments();

    // 3. Orders stats
    const finalizedOrders = await Order.find({ orderStatus: { $ne: "PLACED" } });
    const totalOrders = finalizedOrders.length;

    // Total Revenue (all completed or confirmed orders)
    const totalRevenue = finalizedOrders
      .filter((o) => o.orderStatus !== "CANCELLED")
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Pending Orders (needs café attention)
    const pendingOrders = finalizedOrders.filter((o) =>
      ["ORDER PLACED", "CONFIRMED", "PREPARING"].includes(o.orderStatus)
    ).length;

    // Today's Sales
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = finalizedOrders.filter(
      (o) => new Date(o.createdAt) >= startOfToday && o.orderStatus !== "CANCELLED"
    );
    const todaySales = todayOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Low stock products alert
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
    });

    // 4. Orders by Status Distribution
    const statusCounts = {};
    finalizedOrders.forEach((o) => {
      const st = o.orderStatus || "ORDER PLACED";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // 5. Daily Revenue for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = finalizedOrders
        .filter((o) => {
          const oDate = new Date(o.createdAt);
          return oDate >= dayStart && oDate <= dayEnd && o.orderStatus !== "CANCELLED";
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const dayOrderCount = finalizedOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        return oDate >= dayStart && oDate <= dayEnd;
      }).length;

      last7Days.push({
        day: dayStr,
        revenue: dayRevenue,
        orders: dayOrderCount
      });
    }

    // 6. Category breakdown
    const categoryStats = {};
    finalizedOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((it) => {
          const cat = it.category || "CHAI";
          categoryStats[cat] = (categoryStats[cat] || 0) + (it.price * it.quantity);
        });
      }
    });

    // 7. Top Selling Products
    const productSalesMap = {};
    finalizedOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((it) => {
          const key = it.name || "Item";
          productSalesMap[key] = (productSalesMap[key] || 0) + it.quantity;
        });
      }
    });

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent orders
    const recentOrders = finalizedOrders.slice(0, 6);

    res.send(
      result.createResult(null, {
        kpis: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          pendingOrders,
          todaySales,
          lowStockCount: lowStockProducts.length
        },
        lowStockProducts,
        statusDistribution: statusCounts,
        revenueHistory: last7Days,
        categoryStats,
        topSellingProducts,
        recentOrders
      })
    );
  } catch (err) {
    console.error("Admin Analytics Error:", err);
    res.status(500).send(result.createResult(err.message));
  }
});

// Admin: Get all customers list
router.get("/customers", authUser, isAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.send(result.createResult(null, customers));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
