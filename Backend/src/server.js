import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import env from "./config/env.js";

import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import orderItemsRoutes from "./routes/orderItems.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import recommendationRoutes from "./routes/recommendations.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Connect database
connectDB();

// Test & Health route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Chai Adda Backend API",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderItems", orderItemsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    status: "error",
    error: err.message || "Internal Server Error"
  });
});

// Start Server
app.listen(env.port, () => {
  console.log(`☕ Chai Adda Server running on port ${env.port}`);
});
