import express from "express";
import { Product } from "../models/Product.js";
import { authUser, isAdmin } from "../utils/auth.js";
import result from "../utils/result.js";

const router = express.Router();

// ☕ High-quality default products for Chai Adda
const defaultProducts = [
  {
    productId: "CHAI001",
    p_name: "Adrak Elaichi Masala Chai",
    price: 35,
    description: "Our signature blend of Assam black tea infused with freshly crushed ginger, green cardamom, and aromatic spices brewed in rich milk.",
    category: "CHAI",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: true,
    isVeg: true,
    stockQuantity: 120,
    lowStockThreshold: 15,
    rating: 4.9,
    ratingCount: 342,
    ingredients: ["Assam CTC Tea", "Fresh Ginger", "Cardamom", "Cloves", "Whole Milk", "Jaggery/Sugar"],
    tags: ["Hot", "Signature", "Spiced", "Morning Booster"]
  },
  {
    productId: "CHAI002",
    p_name: "Matka Kulhad Chai",
    price: 45,
    description: "Traditional slow-brewed kadak chai served in an authentic earthen clay cup, delivering an earthy aroma and heavenly taste.",
    category: "CHAI",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 85,
    lowStockThreshold: 10,
    rating: 4.9,
    ratingCount: 289,
    ingredients: ["Special Tea Blend", "Earthen Kulhad", "Nutmeg", "Cardamom", "Full Cream Milk"],
    tags: ["Earthen", "Authentic", "Desi"]
  },
  {
    productId: "CHAI003",
    p_name: "Royal Kashmiri Kahwa",
    price: 65,
    description: "Exquisite green tea brewed with saffron strands, crushed almonds, cinnamon bark, and cloves. Light, rejuvenating, and deeply aromatic.",
    category: "SPECIALS",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&auto=format&fit=crop&q=80",
    isBestseller: false,
    isSpecial: true,
    isVeg: true,
    stockQuantity: 40,
    lowStockThreshold: 8,
    rating: 4.8,
    ratingCount: 110,
    ingredients: ["Kashmiri Green Tea", "Pure Saffron", "Almonds", "Cinnamon", "Wild Honey"],
    tags: ["Kashmir", "Saffron", "Herbal", "Immunity"]
  },
  {
    productId: "CHAI004",
    p_name: "Bombay Cutting Chai",
    price: 25,
    description: "Strong, bold, and energetic half-cup of spiced tea that keeps Mumbai bustling through every hour of the day.",
    category: "CHAI",
    imageUrl: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 200,
    lowStockThreshold: 20,
    rating: 4.7,
    ratingCount: 450,
    ingredients: ["Kadak Assam Tea", "Crushed Ginger", "Fresh Milk", "Cardamom"],
    tags: ["Quick Sip", "Kadak", "Classic"]
  },
  {
    productId: "COF001",
    p_name: "South Indian Filter Coffee",
    price: 50,
    description: "Authentic decoction brew with roasted chicory and frothy steamed milk, poured back and forth for maximum froth and aroma.",
    category: "COFFEE",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 65,
    lowStockThreshold: 10,
    rating: 4.8,
    ratingCount: 198,
    ingredients: ["Chikmagalur Coffee Beans", "Chicory (15%)", "Full Cream Milk"],
    tags: ["Filter Coffee", "Frothy", "South Indian"]
  },
  {
    productId: "COF002",
    p_name: "Artisan Hazelnut Cold Coffee",
    price: 90,
    description: "Velvety smooth espresso blended with chilled milk, premium hazelnut syrup, and crushed ice, topped with cocoa dusting.",
    category: "COFFEE",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80",
    isBestseller: false,
    isSpecial: true,
    isVeg: true,
    stockQuantity: 30,
    lowStockThreshold: 5,
    rating: 4.7,
    ratingCount: 88,
    ingredients: ["Espresso", "Hazelnut Syrup", "Chilled Milk", "Chocolate Drizzle"],
    tags: ["Cold Brew", "Chilled", "Sweet"]
  },
  {
    productId: "SNK001",
    p_name: "Irani Maska Bun with Tutti Frutti",
    price: 45,
    description: "Soft sweet bakery bun lavishly stuffed with salted Amul butter. Best enjoyed dipped straight into piping hot chai!",
    category: "SNACKS",
    imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 50,
    lowStockThreshold: 10,
    rating: 4.9,
    ratingCount: 310,
    ingredients: ["Brioche Bun", "Salted Butter", "Tutti Frutti"],
    tags: ["Bakery", "Best with Chai", "Soft"]
  },
  {
    productId: "SNK002",
    p_name: "Crispy Samosa Pav with Thecha",
    price: 40,
    description: "Golden flaky Punjabi samosa loaded with spiced potatoes and peas, nestled inside a fresh pav with fiery green chilli thecha.",
    category: "SNACKS",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 90,
    lowStockThreshold: 15,
    rating: 4.8,
    ratingCount: 265,
    ingredients: ["Crisp Samosa", "Fresh Pav", "Green Thecha", "Sweet Tamarind Chutney"],
    tags: ["Street Food", "Spicy", "Crispy"]
  },
  {
    productId: "SNK003",
    p_name: "Paneer Bread Pakora (2 Pcs)",
    price: 60,
    description: "Double-layered bread sandwich with spiced mint chutney and thick paneer slice, dipped in spiced gram flour batter and fried crisp.",
    category: "SNACKS",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
    isBestseller: false,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 35,
    lowStockThreshold: 8,
    rating: 4.7,
    ratingCount: 140,
    ingredients: ["Fresh Paneer", "White Bread", "Gram Flour", "Mint Chutney"],
    tags: ["Hot Snack", "Paneer", "Crunchy"]
  },
  {
    productId: "CMB001",
    p_name: "Adda Special Chai + Bun Maska Combo",
    price: 70,
    description: "The timeless café combination: 1 Large Masala Chai paired with 1 warm, butter-loaded Irani Bun Maska. Save ₹10!",
    category: "COMBOS",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    isBestseller: true,
    isSpecial: true,
    isVeg: true,
    stockQuantity: 60,
    lowStockThreshold: 10,
    rating: 5.0,
    ratingCount: 420,
    ingredients: ["Masala Chai", "Irani Bun Maska"],
    tags: ["Value Combo", "Best Value", "Bestseller"]
  },
  {
    productId: "CMB002",
    p_name: "Monsoon Snack Box (2 Chai + 2 Samosa Pav)",
    price: 135,
    description: "Complete companion for evening cravings: 2 Cups of Adrak Chai with 2 piping hot Samosa Pavs and fried green chillies.",
    category: "COMBOS",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
    isBestseller: false,
    isSpecial: true,
    isVeg: true,
    stockQuantity: 45,
    lowStockThreshold: 8,
    rating: 4.9,
    ratingCount: 180,
    ingredients: ["2x Adrak Chai", "2x Samosa Pav", "Chutneys"],
    tags: ["Sharing", "Combo", "Monsoon Special"]
  }
];

// 0️⃣ AUTO-SEED PRODUCTS ON STARTUP IF EMPTY
const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(defaultProducts);
      console.log("🌱 Seeded default Chai Adda products successfully.");
    }
  } catch (err) {
    console.log("Product seed note:", err.message);
  }
};
seedProductsIfEmpty();

// 1️⃣ GET ALL PRODUCTS (with search, category, veg, sort, availability)
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      vegOnly,
      isSpecial,
      isBestseller,
      sortBy,
      availableOnly,
      minPrice,
      maxPrice
    } = req.query;

    const filter = {};

    // Category filter
    if (category && category !== "ALL") {
      filter.category = category.toUpperCase();
    }

    // Availability filter (default true for customers, admin can see all)
    if (availableOnly === "true") {
      filter.isAvailable = true;
    }

    // Veg Only filter
    if (vegOnly === "true") {
      filter.isVeg = true;
    }

    // Special / Bestseller flags
    if (isSpecial === "true") filter.isSpecial = true;
    if (isBestseller === "true") filter.isBestseller = true;

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Text search query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { p_name: regex },
        { description: regex },
        { category: regex },
        { ingredients: regex },
        { tags: regex }
      ];
    }

    // Sorting
    let sortOptions = { isBestseller: -1, rating: -1, createdAt: -1 };
    if (sortBy === "price_asc") sortOptions = { price: 1 };
    else if (sortBy === "price_desc") sortOptions = { price: -1 };
    else if (sortBy === "rating") sortOptions = { rating: -1, ratingCount: -1 };
    else if (sortBy === "newest") sortOptions = { createdAt: -1 };
    else if (sortBy === "name_asc") sortOptions = { p_name: 1 };

    const products = await Product.find(filter).sort(sortOptions);

    res.send(result.createResult(null, products));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 2️⃣ SEED / RESET PRODUCTS ENDPOINT
router.post("/seed", authUser, isAdmin, async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(defaultProducts);
    res.send(result.createResult(null, created, "Products seeded successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 3️⃣ GET SINGLE PRODUCT (by productId or _id)
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    let product = await Product.findOne({ productId });
    if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).send(result.createResult("Product not found"));
    }

    res.send(result.createResult(null, product));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 4️⃣ ADD PRODUCT (ADMIN)
router.post("/", authUser, isAdmin, async (req, res) => {
  try {
    const {
      productId,
      p_name,
      price,
      description,
      category,
      imageUrl,
      isAvailable,
      isBestseller,
      isSpecial,
      isVeg,
      stockQuantity,
      lowStockThreshold,
      ingredients
    } = req.body;

    if (!productId || !p_name || price === undefined) {
      return res.status(400).send(result.createResult("Product ID, Name, and Price are required"));
    }

    const newProduct = await Product.create({
      productId: productId.trim(),
      p_name: p_name.trim(),
      price: Number(price),
      description: description || "",
      category: (category || "CHAI").toUpperCase(),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isBestseller: Boolean(isBestseller),
      isSpecial: Boolean(isSpecial),
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 50,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 10,
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : (typeof ingredients === "string" ? ingredients.split(",").map(i => i.trim()).filter(Boolean) : [])
    });

    res.status(201).send(result.createResult(null, newProduct, "Product added successfully"));
  } catch (err) {
    res.status(400).send(result.createResult(err.message));
  }
});

// 5️⃣ UPDATE PRODUCT (ADMIN)
router.put("/:productId", authUser, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const updateData = { ...req.body };
    if (updateData.category) {
      updateData.category = updateData.category.toUpperCase();
    }
    if (typeof updateData.ingredients === "string") {
      updateData.ingredients = updateData.ingredients.split(",").map(i => i.trim()).filter(Boolean);
    }

    let updated = await Product.findOneAndUpdate(
      { productId },
      { $set: updateData },
      { new: true }
    );

    if (!updated && productId.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).send(result.createResult("Product not found to update"));
    }

    res.send(result.createResult(null, updated, "Product updated successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 6️⃣ TOGGLE AVAILABILITY / STOCK (ADMIN)
router.patch("/:productId/stock", authUser, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { isAvailable, stockQuantity } = req.body;

    const updateFields = {};
    if (isAvailable !== undefined) updateFields.isAvailable = Boolean(isAvailable);
    if (stockQuantity !== undefined) updateFields.stockQuantity = Number(stockQuantity);

    const product = await Product.findOneAndUpdate(
      { $or: [{ productId }, { _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }] },
      { $set: updateFields },
      { new: true }
    );

    if (!product) {
      return res.status(404).send(result.createResult("Product not found"));
    }

    res.send(result.createResult(null, product, "Stock updated"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

// 7️⃣ DELETE PRODUCT (ADMIN)
router.delete("/:productId", authUser, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    let deleted = await Product.findOneAndDelete({ productId });
    if (!deleted && productId.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Product.findByIdAndDelete(productId);
    }

    if (!deleted) {
      return res.status(404).send(result.createResult("Product not found to delete"));
    }

    res.send(result.createResult(null, "Product deleted successfully"));
  } catch (err) {
    res.status(500).send(result.createResult(err.message));
  }
});

export default router;
