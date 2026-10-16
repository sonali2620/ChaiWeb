import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { User } from "../models/user.js";
import { Customer } from "../models/customer.js";
import { authUser } from "../utils/auth.js";
import result from "../utils/result.js";
import env from "../config/env.js";

const router = express.Router();

// Helper to hash password
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Auto ensure default admin exists on server boot / first request
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@chaiadda.com";
    const existingAdmin = await User.findById(adminEmail);
    if (!existingAdmin) {
      await User.create({
        _id: adminEmail,
        password: hashPassword("admin123"),
        role: "ADMIN"
      });
      console.log("👑 Default admin initialized: admin@chaiadda.com / admin123");
    }
  } catch (err) {
    // Ignore duplicate error on concurrent launches
  }
};
ensureDefaultAdmin();

// 1️⃣ USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send(result.createResult("Email & password are required"));
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const user =
      (await User.findById(cleanEmail)) ||
      (await User.findOne({ _id: new RegExp(`^${cleanEmail}$`, "i") }));

    if (!user) {
      return res.status(400).send(result.createResult("Invalid email or password"));
    }

    // Compare hash
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).send(result.createResult("Invalid email or password"));
    }

    // Get customer info
    const customer = await Customer.findOne({ email: cleanEmail });

    // Generate JWT
    const token = jwt.sign(
      { email: user._id, role: user.role },
      env.jwtSecret,
      { expiresIn: "7d" }
    );

    // Response
    res.send(
      result.createResult(null, {
        token,
        user: {
          email: user._id,
          name: customer?.name || (user.role === "ADMIN" ? "Admin Master" : user._id.split("@")[0]),
          mobileNo: customer?.mobileNo || "",
          address: customer?.address || "",
          role: user.role
        }
      }, "Login successful")
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).send(result.createResult(err.message));
  }
});

// 2️⃣ GET CURRENT AUTH USER
router.get("/me", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.email.toLowerCase());
    if (!user) {
      return res.status(404).send(result.createResult("User not found"));
    }

    const customer = await Customer.findOne({ email: req.user.email.toLowerCase() });

    res.send(
      result.createResult(null, {
        email: user._id,
        role: user.role,
        name: customer?.name || user._id.split("@")[0],
        mobileNo: customer?.mobileNo || "",
        address: customer?.address || "",
        favorites: customer?.favorites || []
      })
    );
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;