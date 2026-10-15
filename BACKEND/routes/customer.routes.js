import express from "express";

import {
  registerCustomer,
  loginCustomer,
  getCustomer,
  logoutCustomer,
  changePassword,
  updateWishlist,
  getWishlist,
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);
customerRoutes.post("/login", loginCustomer);
customerRoutes.get("/me", isAuthenticated, getCustomer);
customerRoutes.post("/logout", logoutCustomer);
customerRoutes.patch("/change-password", isAuthenticated, changePassword);
customerRoutes.post("/wishlist/:productId", isAuthenticated, updateWishlist);
customerRoutes.get("/wishlist", isAuthenticated, getWishlist);

export default customerRoutes;
