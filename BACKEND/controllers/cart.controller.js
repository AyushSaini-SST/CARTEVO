import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// POST /cart/:productId
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.customer._id);
    const cartItem = customer.cart.find((item) => item.product.toString() === productId);

    if (cartItem) {
      // Product already in cart, increment quantity
      if (cartItem.quantity + 1 > product.stock) {
        return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
      }
      cartItem.quantity += 1;
    } else {
      // Add new product to cart
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Populate the updated cart to return
    await customer.populate({ path: "cart.product", select: "name price image stock" });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: customer.cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /cart
export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).populate({
      path: "cart.product",
      select: "name price image stock"
    });

    return res.status(200).json({
      success: true,
      cart: customer.cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// PATCH /cart/:productId
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.customer._id);
    const cartItem = customer.cart.find((item) => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
    }

    cartItem.quantity = quantity;
    await customer.save();

    await customer.populate({ path: "cart.product", select: "name price image stock" });

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: customer.cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const customer = await Customer.findById(req.customer._id);
    const cartItemIndex = customer.cart.findIndex((item) => item.product.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    customer.cart.splice(cartItemIndex, 1);
    await customer.save();

    await customer.populate({ path: "cart.product", select: "name price image stock" });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};