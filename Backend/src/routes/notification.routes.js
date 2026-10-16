import express from "express";
import { Notification } from "../models/Notification.js";
import { authUser } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// 1. Get notifications for logged in user
router.get("/", authUser, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const notifications = await Notification.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ userEmail, isRead: false });

    res.send(
      result.createResult(null, {
        notifications,
        unreadCount
      })
    );
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 2. Mark single notification as read
router.put("/:id/read", authUser, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.send(result.createResult(null, notification));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 3. Mark all as read
router.put("/read-all", authUser, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    await Notification.updateMany({ userEmail }, { isRead: true });
    res.send(result.createResult(null, "All notifications marked as read"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
