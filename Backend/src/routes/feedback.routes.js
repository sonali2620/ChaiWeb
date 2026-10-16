import express from "express";
import { Feedback } from "../models/feedback.js";
import { Customer } from "../models/customer.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// Seed initial testimonials if empty
const seedFeedbacks = async () => {
  try {
    const count = await Feedback.countDocuments();
    if (count === 0) {
      await Feedback.insertMany([
        {
          userEmail: "aarav.sharma@gmail.com",
          userName: "Aarav Sharma",
          rating: 5,
          comment: "Best Masala Chai in town! The aroma of freshly crushed cardamom and ginger gives an authentic homemade feel. Bun maska was super soft.",
          isVerifiedBuyer: true
        },
        {
          userEmail: "priya.patel@gmail.com",
          userName: "Priya Patel",
          rating: 5,
          comment: "Loved the Matka Kulhad Chai and Samosa Pav combo. Delivery was ultra quick within 20 mins and the chai was boiling hot. 10/10!",
          isVerifiedBuyer: true
        },
        {
          userEmail: "rohit.deshmukh@gmail.com",
          userName: "Rohit Deshmukh",
          rating: 5,
          comment: "Royal Kashmiri Kahwa is pure luxury. Perfect level of saffron and crunchy sliced almonds. Ordering every evening from now on!",
          isVerifiedBuyer: true
        }
      ]);
      console.log("⭐ Seeded initial customer reviews.");
    }
  } catch (e) {}
};
seedFeedbacks();

// 1. Submit Feedback (with duplicate review protection)
router.post("/", async (req, res) => {
  try {
    const { userEmail, userName, rating, comment, productId, productName } = req.body;

    if (!userEmail || !rating || !comment) {
      return res.status(400).send(result.createResult("Email, rating, and comment are required"));
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    // Check if customer exists to get friendly name
    const customer = await Customer.findOne({ email: cleanEmail });
    const resolvedName = userName || customer?.name || cleanEmail.split("@")[0];

    // Prevent excessive duplicate spam within 2 minutes
    const recentFeedback = await Feedback.findOne({
      userEmail: cleanEmail,
      comment: comment.trim(),
      createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
    });

    if (recentFeedback) {
      return res.status(400).send(result.createResult("You have recently submitted this review."));
    }

    const feedback = await Feedback.create({
      userEmail: cleanEmail,
      userName: resolvedName,
      rating: Number(rating),
      comment: comment.trim(),
      productId: productId || null,
      productName: productName || "",
      isVerifiedBuyer: true
    });

    res.status(201).send(result.createResult(null, feedback, "Thank you for your valuable feedback! ⭐"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 2. Get Public Testimonials / High Rated Reviews
router.get("/testimonials", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(6);
    res.send(result.createResult(null, feedbacks));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 3. Get All Feedbacks (Admin + Backward Compatible)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    // Support both direct array response (backward compatible) and result envelope
    if (req.query.envelope === "true") {
      res.send(result.createResult(null, feedbacks));
    } else {
      res.json(feedbacks);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Delete Feedback (Admin)
router.delete("/:id", authUser, isAdmin, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.send(result.createResult(null, "Feedback deleted"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;