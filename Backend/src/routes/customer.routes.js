import express from "express";
import crypto from "crypto";

import { User } from "../models/user.js";
import { Customer } from "../models/customer.js";
import { Product } from "../models/Product.js";
import { authUser } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// 1️⃣ CUSTOMER REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, mobileNo, address } = req.body;

    if (!email || !password || !name || !mobileNo || !address) {
      return res.status(400).send(result.createResult("All fields are required"));
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findById(cleanEmail);
    if (existingUser) {
      return res.status(400).send(result.createResult("User with this email already exists"));
    }

    // Hash password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create User record
    await User.create({
      _id: cleanEmail,
      password: hashedPassword,
      role: "CUSTOMER"
    });

    // Create Customer record
    const newCustomer = await Customer.create({
      customerId: `CUST_${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      mobileNo: mobileNo.trim(),
      address: address.trim(),
      savedAddresses: [
        {
          label: "Home",
          street: address.trim(),
          city: "Pune",
          pincode: "411001",
          isDefault: true
        }
      ]
    });

    res.status(201).send(result.createResult(null, newCustomer, "Customer registered successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 2️⃣ GET CUSTOMER PROFILE (LOGIN REQUIRED)
router.get("/profile", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    let customer = await Customer.findOne({ email });

    if (!customer) {
      // Auto-create customer profile fallback if user registered before
      customer = await Customer.create({
        customerId: `CUST_${Date.now()}`,
        email,
        name: email.split("@")[0],
        mobileNo: "9876543210",
        address: "Pune, Maharashtra"
      });
    }

    res.send(result.createResult(null, customer));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 3️⃣ UPDATE CUSTOMER PROFILE
router.put("/profile", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const { name, mobileNo, address } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { email },
      { $set: { name, mobileNo, address } },
      { new: true }
    );

    if (!customer) {
      return res.status(404).send(result.createResult("Customer not found"));
    }

    res.send(result.createResult(null, customer, "Profile updated successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 4️⃣ SAVED ADDRESSES (ADD)
router.post("/address", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const { label, street, city, pincode, landmark, isDefault } = req.body;

    if (!street || !pincode) {
      return res.status(400).send(result.createResult("Street and Pincode are required"));
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).send(result.createResult("Customer not found"));
    }

    if (isDefault) {
      customer.savedAddresses.forEach((addr) => (addr.isDefault = false));
    }

    customer.savedAddresses.push({
      label: label || "Home",
      street,
      city: city || "Pune",
      pincode,
      landmark: landmark || "",
      isDefault: Boolean(isDefault)
    });

    await customer.save();
    res.send(result.createResult(null, customer.savedAddresses, "Address added"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 5️⃣ SAVED ADDRESSES (DELETE)
router.delete("/address/:addressId", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const { addressId } = req.params;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).send(result.createResult("Customer not found"));
    }

    customer.savedAddresses = customer.savedAddresses.filter(
      (a) => a._id.toString() !== addressId
    );

    await customer.save();
    res.send(result.createResult(null, customer.savedAddresses, "Address removed"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 6️⃣ TOGGLE FAVORITE
router.post("/favorites/toggle", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).send(result.createResult("ProductId is required"));
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).send(result.createResult("Customer not found"));
    }

    const index = customer.favorites.indexOf(productId);
    let isFavorited = false;

    if (index > -1) {
      customer.favorites.splice(index, 1);
      isFavorited = false;
    } else {
      customer.favorites.push(productId);
      isFavorited = true;
    }

    await customer.save();

    res.send(
      result.createResult(null, {
        favorites: customer.favorites,
        isFavorited
      }, isFavorited ? "Added to favorites" : "Removed from favorites")
    );
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 7️⃣ GET FAVORITES WITH PRODUCT DATA
router.get("/favorites", authUser, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    const customer = await Customer.findOne({ email });

    if (!customer || !customer.favorites || customer.favorites.length === 0) {
      return res.send(result.createResult(null, []));
    }

    // Match both by _id or productId
    const products = await Product.find({
      $or: [
        { productId: { $in: customer.favorites } },
        { _id: { $in: customer.favorites.filter((f) => f.match(/^[0-9a-fA-F]{24}$/)) } }
      ]
    });

    res.send(result.createResult(null, products));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
