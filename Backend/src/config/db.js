import mongoose from "mongoose";
import env from "../config/env.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB Connected : ${conn.connection.host}`);

    // Drop legacy conflicting index on orders if present
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      const ordersCol = collections.find((c) => c.name === "orders" || c.name === "Order");
      if (ordersCol) {
        const indexes = await conn.connection.db.collection(ordersCol.name).indexes();
        const hasLegacyOrderIdIndex = indexes.find((idx) => idx.name === "orderId_1");
        if (hasLegacyOrderIdIndex) {
          await conn.connection.db.collection(ordersCol.name).dropIndex("orderId_1");
          console.log("🧹 Cleaned up legacy orderId_1 index.");
        }
      }
    } catch (idxErr) {
      // Ignore if index doesn't exist
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
