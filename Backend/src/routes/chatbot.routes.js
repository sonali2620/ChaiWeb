import express from "express";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/order.js";
import result from "../utils/result.js";

const router = express.Router();

// Intelligent rule-based Chai Assistant Engine
const getRuleBasedResponse = async (userMessage, context = {}) => {
  const msg = userMessage.toLowerCase().trim();
  const userName = context.userName || "Friend";

  // 1. Strong / Less Sweet / Spiced Tea
  if (
    msg.includes("strong") ||
    msg.includes("kadak") ||
    msg.includes("less sweet") ||
    msg.includes("ginger") ||
    msg.includes("adrak") ||
    msg.includes("spicy") ||
    msg.includes("masala")
  ) {
    const products = await Product.find({
      category: "CHAI",
      isAvailable: true,
      $or: [{ p_name: /Masala/i }, { p_name: /Adrak/i }, { p_name: /Cutting/i }]
    }).limit(3);

    return {
      text: `Hello ${userName}! ☕ For a strong, invigorating cup, I highly recommend our **Adrak Elaichi Masala Chai** or **Bombay Cutting Chai**. Both are slow-brewed with fresh ginger and whole spices. You can request less sugar in the order instructions!`,
      suggestions: ["Show Masala Chai", "What snacks go with this?", "Order Kulhad Chai"],
      products: products
    };
  }

  // 2. What to pair with tea / snacks recommendations
  if (
    msg.includes("what should i order") ||
    msg.includes("pair") ||
    msg.includes("snack") ||
    msg.includes("combo") ||
    msg.includes("with tea") ||
    msg.includes("with chai")
  ) {
    const products = await Product.find({
      isAvailable: true,
      category: { $in: ["SNACKS", "COMBOS"] }
    }).limit(3);

    return {
      text: `Our all-time café favorite combinations are:\n\n1. ☕ **Masala Chai + Irani Bun Maska** (Warm butter melts in your mouth!)\n2. ☕ **Adrak Chai + Crispy Samosa Pav** with spicy green thecha.\n3. ☕ **Adda Special Chai + Bun Maska Combo** (Save ₹10!).`,
      suggestions: ["Add Bun Maska Combo", "Show Samosa Pav", "View All Combos"],
      products: products
    };
  }

  // 3. Best Sellers / Recommendations
  if (
    msg.includes("bestseller") ||
    msg.includes("popular") ||
    msg.includes("famous") ||
    msg.includes("recommend") ||
    msg.includes("must try")
  ) {
    const products = await Product.find({ isBestseller: true, isAvailable: true }).limit(3);

    return {
      text: `Here are our customer-favorite bestsellers today:\n\n⭐ **Matka Kulhad Chai** — Traditional clay cup aroma\n⭐ **South Indian Filter Coffee** — Frothy & intense chicory blend\n⭐ **Irani Maska Bun** — Loaded with fresh Amul butter`,
      suggestions: ["Order Matka Chai", "Filter Coffee", "See Menu"],
      products: products
    };
  }

  // 4. Kashmiri Kahwa / Herbal / Health / Immunity
  if (
    msg.includes("kahwa") ||
    msg.includes("saffron") ||
    msg.includes("green tea") ||
    msg.includes("immunity") ||
    msg.includes("herbal") ||
    msg.includes("healthy")
  ) {
    const products = await Product.find({
      category: "SPECIALS",
      isAvailable: true
    }).limit(2);

    return {
      text: `You will love our **Royal Kashmiri Kahwa**! 🌸 It's brewed with genuine Kashmiri saffron strands, crushed almonds, cinnamon bark, and wild honey. Great for immunity and digestion!`,
      suggestions: ["View Kashmiri Kahwa", "What are the ingredients?", "Show Chai Menu"],
      products: products
    };
  }

  // 5. Coffee questions
  if (msg.includes("coffee") || msg.includes("cold coffee") || msg.includes("filter coffee")) {
    const products = await Product.find({ category: "COFFEE", isAvailable: true }).limit(2);

    return {
      text: `Craving coffee? ☕ We serve authentic **South Indian Filter Coffee** made from Chikmagalur beans, as well as chilled **Artisan Hazelnut Cold Coffee** with chocolate drizzle!`,
      suggestions: ["South Indian Filter Coffee", "Hazelnut Cold Coffee", "Show Snacks"],
      products: products
    };
  }

  // 6. Discounts / Coupons / Offers
  if (
    msg.includes("coupon") ||
    msg.includes("offer") ||
    msg.includes("discount") ||
    msg.includes("promo") ||
    msg.includes("code") ||
    msg.includes("deal")
  ) {
    const coupons = await Coupon.find({ isActive: true }).limit(3);
    let couponText = "Here are today's active promo codes you can apply at checkout:\n\n";
    coupons.forEach((c) => {
      couponText += `🏷️ **${c.code}**: ${c.description}\n`;
    });

    return {
      text: couponText,
      suggestions: ["Apply CHAI10", "Apply WELCOME50", "Go to Cart"],
      products: []
    };
  }

  // 7. Track my order / order status
  if (
    msg.includes("track") ||
    msg.includes("my order") ||
    msg.includes("where is my order") ||
    msg.includes("status")
  ) {
    if (context.userEmail) {
      const recentOrder = await Order.findOne({
        customerEmail: context.userEmail.toLowerCase(),
        orderStatus: { $ne: "PLACED" }
      }).sort({ createdAt: -1 });

      if (recentOrder) {
        return {
          text: `Your most recent order **#${recentOrder._id.toString().slice(-6).toUpperCase()}** is currently **${recentOrder.orderStatus}**.\n\nTotal: ₹${recentOrder.totalAmount}\nDelivery to: ${recentOrder.deliveryAddress?.street || "Pune"}\nEstimated preparation/delivery: ~${recentOrder.estimatedMinutes || 20} mins.`,
          suggestions: ["View Tracking Details", "Order Again", "Talk to Support"],
          orderId: recentOrder._id
        };
      }
    }

    return {
      text: `You can track all your live orders in the **My Orders** section of your profile! Or login to let me check your active order right here.`,
      suggestions: ["Go to My Orders", "View Menu", "Active Offers"]
    };
  }

  // 8. Timings / Location / Store info
  if (
    msg.includes("timing") ||
    msg.includes("hours") ||
    msg.includes("open") ||
    msg.includes("location") ||
    msg.includes("address") ||
    msg.includes("where are you")
  ) {
    return {
      text: `📍 **Chai Adda Café & Kitchen** is open every day from **7:00 AM to 11:30 PM**!\n\nWe provide fresh delivery within 20-30 minutes anywhere in the city. You can also customize your tea sweetness in the delivery instructions.`,
      suggestions: ["Explore Menu", "Today's Specials", "Check Offers"]
    };
  }

  // 9. Greetings
  if (
    msg === "hi" ||
    msg === "hello" ||
    msg === "hey" ||
    msg.includes("good morning") ||
    msg.includes("good evening")
  ) {
    return {
      text: `Namaste ${userName}! 🙏 Welcome to Chai Adda. How can I help you today? I can recommend teas, find matching snacks, explain ingredients, check current discounts, or track your order!`,
      suggestions: ["Recommend something strong", "What snacks go with chai?", "Today's Offers", "Bestsellers"]
    };
  }

  // Default intelligent helpful response
  return {
    text: `I'd love to help you find your perfect sip! Would you like a rich **Masala Chai**, earthen **Kulhad Chai**, or a buttery **Bun Maska**? You can also ask me about ingredients, discounts, or delivery times.`,
    suggestions: ["Show Best Teas", "Snack Options", "Active Offers", "Filter Coffee"]
  };
};

// Chat endpoint
router.post("/message", async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).send(result.createResult("Message cannot be empty"));
    }

    // Call rule-based / knowledge engine
    const reply = await getRuleBasedResponse(message, context);

    res.send(result.createResult(null, reply));
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).send(
      result.createResult(null, {
        text: "I'm right here to help! Try asking about our Masala Chai, Kulhad Chai, Snacks, or discount coupons.",
        suggestions: ["Show Masala Chai", "Bun Maska", "Active Offers"]
      })
    );
  }
});

export default router;
