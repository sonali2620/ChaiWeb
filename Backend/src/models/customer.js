import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // Home, Work, Other
  street: { type: String, required: true },
  city: { type: String, default: "Pune" },
  pincode: { type: String, required: true },
  landmark: { type: String, default: "" },
  isDefault: { type: Boolean, default: false }
});

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    savedAddresses: [addressSchema],
    favorites: [
      {
        type: String // productId strings or objectIds
      }
    ],
    avatar: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const Customer =
  mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);
